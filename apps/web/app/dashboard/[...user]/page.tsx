import { ClientDashboard } from "../../../components/Dashboard";

export default async function Dashboard({ params }: {
    params: {
        user: [
            name: string,
            email: string
        ]
    }
}) {
    const user = (await params).user;
    return <ClientDashboard
    name={user[0].replace("%20"," ")}
    email={user[1].replace("%40","@")}
    />
}