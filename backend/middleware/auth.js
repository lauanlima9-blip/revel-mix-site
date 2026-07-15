import jwt from 'jsonwebtoken';
export function requireAuth(req,res,next){
  const token=req.headers.authorization?.replace('Bearer ','');
  if(!token) return res.status(401).json({message:'Não autorizado.'});
  try { req.admin=jwt.verify(token,process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({message:'Sessão inválida ou expirada.'}); }
}
