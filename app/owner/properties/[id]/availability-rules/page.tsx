import AvailabilityRulesPage from "./availability-rules-page";

export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AvailabilityRulesPage id={id}/>}
