import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from './middleware/auth.js';

const prisma=new PrismaClient();
const app=express();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin:process.env.FRONTEND_URL?.split(',') || '*'}));
app.use(express.json({limit:'2mb'}));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use('/api',rateLimit({windowMs:15*60*1000,limit:250,standardHeaders:true,legacyHeaders:false}));

const upload=multer({storage:multer.diskStorage({destination:'uploads/',filename:(_,file,cb)=>cb(null,`${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g,'-')}`)}),limits:{fileSize:8*1024*1024},fileFilter:(_,file,cb)=>cb(null,file.mimetype.startsWith('image/'))});

app.get('/api/health',(_,res)=>res.json({status:'ok'}));
app.get('/api/public',async(_,res)=>{
  const [services,gallery,reviews,settings]=await Promise.all([
    prisma.service.findMany({where:{active:true},orderBy:{id:'asc'}}),
    prisma.galleryImage.findMany({where:{active:true},orderBy:{createdAt:'desc'}}),
    prisma.review.findMany({where:{status:'APPROVED'},orderBy:{createdAt:'desc'}}),
    prisma.setting.findMany()
  ]);
  res.json({services:services.map(s=>({...s,pricePerM2:Number(s.pricePerM2)})),gallery,reviews,settings:Object.fromEntries(settings.map(s=>[s.key,s.value]))});
});

app.post('/api/auth/login',async(req,res)=>{
  const parsed=z.object({email:z.string().email(),password:z.string().min(6)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({message:'Dados inválidos.'});
  const admin=await prisma.admin.findUnique({where:{email:parsed.data.email}});
  if(!admin || !(await bcrypt.compare(parsed.data.password,admin.password))) return res.status(401).json({message:'E-mail ou senha incorretos.'});
  res.json({token:jwt.sign({id:admin.id,email:admin.email},process.env.JWT_SECRET,{expiresIn:'8h'})});
});

app.post('/api/reviews',async(req,res)=>{
  const schema=z.object({name:z.string().min(2).max(80),city:z.string().max(80).optional().or(z.literal('')),rating:z.number().int().min(1).max(5),comment:z.string().min(10).max(1000)});
  const parsed=schema.safeParse(req.body); if(!parsed.success) return res.status(400).json({message:'Revise os dados da avaliação.'});
  await prisma.review.create({data:{...parsed.data,city:parsed.data.city || null}});
  res.status(201).json({message:'Obrigado por compartilhar sua experiência. Sua avaliação será analisada antes de ser publicada.'});
});

app.post('/api/contact',async(req,res)=>{
  const schema=z.object({name:z.string().min(2),phone:z.string().min(8),email:z.string().email(),serviceType:z.string().min(2),area:z.number().nonnegative().optional().nullable(),message:z.string().min(5).max(2000)});
  const parsed=schema.safeParse(req.body); if(!parsed.success) return res.status(400).json({message:'Revise os dados do formulário.'});
  await prisma.contactMessage.create({data:parsed.data});
  res.status(201).json({message:'Obrigado pelo contato. Nossa equipe responderá o mais breve possível.'});
});

app.get('/api/admin/dashboard',requireAuth,async(_,res)=>{
  const [services,gallery,reviews,messages,settings]=await Promise.all([prisma.service.findMany(),prisma.galleryImage.findMany({orderBy:{createdAt:'desc'}}),prisma.review.findMany({orderBy:{createdAt:'desc'}}),prisma.contactMessage.findMany({orderBy:{createdAt:'desc'}}),prisma.setting.findMany()]);
  res.json({services:services.map(s=>({...s,pricePerM2:Number(s.pricePerM2)})),gallery,reviews,messages,settings:Object.fromEntries(settings.map(s=>[s.key,s.value]))});
});
app.put('/api/admin/services/:id',requireAuth,async(req,res)=>{const data=z.object({title:z.string(),description:z.string(),pricePerM2:z.number().positive(),active:z.boolean()}).parse(req.body);res.json(await prisma.service.update({where:{id:Number(req.params.id)},data}));});
app.patch('/api/admin/reviews/:id',requireAuth,async(req,res)=>{const data=z.object({status:z.enum(['PENDING','APPROVED','REJECTED']).optional(),response:z.string().max(1000).nullable().optional()}).parse(req.body);res.json(await prisma.review.update({where:{id:Number(req.params.id)},data}));});
app.delete('/api/admin/reviews/:id',requireAuth,async(req,res)=>{await prisma.review.delete({where:{id:Number(req.params.id)}});res.status(204).end();});
app.patch('/api/admin/messages/:id',requireAuth,async(req,res)=>{res.json(await prisma.contactMessage.update({where:{id:Number(req.params.id)},data:{read:Boolean(req.body.read)}}));});
app.post('/api/admin/gallery',requireAuth,upload.single('image'),async(req,res)=>{if(!req.file)return res.status(400).json({message:'Selecione uma imagem.'});const category=z.enum(['URETANO','EPOXI','TECNOCIMENTO']).parse(req.body.category);const url=`${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;res.status(201).json(await prisma.galleryImage.create({data:{title:req.body.title || null,category,url}}));});
app.delete('/api/admin/gallery/:id',requireAuth,async(req,res)=>{await prisma.galleryImage.delete({where:{id:Number(req.params.id)}});res.status(204).end();});
app.put('/api/admin/settings',requireAuth,async(req,res)=>{const entries=z.record(z.string()).parse(req.body);for(const [key,value] of Object.entries(entries))await prisma.setting.upsert({where:{key},update:{value},create:{key,value}});res.json({ok:true});});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Erro interno do servidor.'});});
app.listen(process.env.PORT || 4000,()=>console.log(`API Revel Mix na porta ${process.env.PORT || 4000}`));
