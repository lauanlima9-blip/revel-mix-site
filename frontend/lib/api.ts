export const API=process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SERVER_API=process.env.INTERNAL_API_URL || API;

const fallbackServices=[
 {id:1,slug:'uretano',title:'Uretano Alto Nivelante',description:'Ideal para indústrias alimentícias, frigoríficos, hospitais, cozinhas industriais e ambientes que exigem alta resistência química, mecânica e térmica.',pricePerM2:30},
 {id:2,slug:'epoxi',title:'Piso Epóxi',description:'Acabamento liso, brilhante e extremamente resistente para galpões, indústrias, estacionamentos, hospitais e estabelecimentos comerciais.',pricePerM2:25},
 {id:3,slug:'tecnocimento',title:'Tecnocimento (Cimento Queimado)',description:'Acabamento sofisticado e contemporâneo para ambientes residenciais e comerciais.',pricePerM2:50}
];

export async function getPublic(){
 try{
  const r=await fetch(`${SERVER_API}/public`,{cache:'no-store'});
  if(!r.ok)throw new Error('API indisponível');
  return r.json();
 }catch{
  return {services:fallbackServices,gallery:[],reviews:[],settings:{}};
 }
}
