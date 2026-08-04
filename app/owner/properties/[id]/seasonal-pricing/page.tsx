import SeasonalPricingPage from "./seasonal-pricing-page";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <SeasonalPricingPage id={id}/>}
