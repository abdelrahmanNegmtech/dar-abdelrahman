import CalendarManagementPage from "../calendar/calendar-management-page";

export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <CalendarManagementPage id={id}/>}
