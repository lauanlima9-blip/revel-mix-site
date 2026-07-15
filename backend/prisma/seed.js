import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const services = [
  ['uretano','Uretano Alto Nivelante','Ideal para indústrias alimentícias, frigoríficos, hospitais, cozinhas industriais e ambientes que exigem alta resistência química, mecânica e térmica.',30],
  ['epoxi','Piso Epóxi','Acabamento liso, brilhante e extremamente resistente para galpões, indústrias, estacionamentos, hospitais e estabelecimentos comerciais.',25],
  ['tecnocimento','Tecnocimento (Cimento Queimado)','Acabamento sofisticado e contemporâneo para ambientes residenciais e comerciais.',50]
];
async function main(){
  const email=process.env.ADMIN_EMAIL || 'admin@revelmix.com.br';
  const password=await bcrypt.hash(process.env.ADMIN_PASSWORD || 'TroqueEstaSenha123!',12);
  await prisma.admin.upsert({where:{email},update:{password},create:{email,password}});
  for(const [slug,title,description,pricePerM2] of services){
    await prisma.service.upsert({where:{slug},update:{title,description,pricePerM2},create:{slug,title,description,pricePerM2}});
  }
  const settings={phone:'(11) 96312-3807',whatsapp:'5511963123807',email:'Rivelmixrevestimentos@gmail.com',instagram:'https://www.instagram.com/revestimento_de_piso_epoxi/',companyName:'Revel Mix Revestimentos Ltda'};
  for(const [key,value] of Object.entries(settings)) await prisma.setting.upsert({where:{key},update:{value},create:{key,value}});
}
main().finally(()=>prisma.$disconnect());
