import Site from '@/components/Site';
import {getPublic} from '@/lib/api';
import {staticGallery} from '@/lib/staticGallery';

export default async function Page(){
 const data=await getPublic();
 const dynamic=Array.isArray(data.gallery)?data.gallery:[];
 const seen=new Set(dynamic.map((item:any)=>item.url));
 return <Site data={{...data,gallery:[...dynamic,...staticGallery.filter(item=>!seen.has(item.url))]}}/>;
}
