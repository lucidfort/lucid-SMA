"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    CreditCard,
    AlertTriangle,
    Users,
    GraduationCap,
} from "lucide-react"

type TrendDirection = "up" | "down" | "neutral"
// Mock data based on Nigerian school context
const kpiData = {
    totalInvoices: { value: 2450, change: 12, trend: "up" },
    totalPayments: { value: 1850000, change: 8, trend: "up" },
    outstandingBalance: { value: 450000, change: -5, trend: "down" },
    scholarshipsAwarded: { value: 125000, change: 15, trend: "up" },
    payrollDue: { value: 850000, change: 0, trend: "neutral" },
    overdueInvoices: { value: 23, change: -8, trend: "down" },
}

const monthlyData = [
    { month: "Jan", income: 2400000, expenses: 1800000 },
    { month: "Feb", income: 2200000, expenses: 1750000 },
    { month: "Mar", income: 2800000, expenses: 1900000 },
    { month: "Apr", income: 2600000, expenses: 1850000 },
    { month: "May", income: 2900000, expenses: 2000000 },
    { month: "Jun", income: 3100000, expenses: 2100000 },
]

const paymentMethodData = [
    { name: "Bank Transfer", value: 45, color: "var(--chart-1)" },
    { name: "Cash", value: 30, color: "var(--chart-2)" },
    { name: "POS", value: 20, color: "var(--chart-3)" },
    { name: "Online", value: 5, color: "var(--chart-4)" },
]

const recentInvoices = [
    { id: "INV-001", student: "Adebayo Johnson", class: "SS3A", amount: 45000, status: "paid", dueDate: "2024-01-15" },
    { id: "INV-002", student: "Fatima Ibrahim", class: "JSS2B", amount: 38000, status: "pending", dueDate: "2024-01-20" },
    { id: "INV-003", student: "Chidi Okafor", class: "SS1C", amount: 42000, status: "overdue", dueDate: "2024-01-10" },
    { id: "INV-004", student: "Aisha Mohammed", class: "JSS3A", amount: 40000, status: "partial", dueDate: "2024-01-18" },
]

const KPICard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    format = "number",
}: {
    title: string
    value: number
    change: number
    trend: TrendDirection
    icon: any
    format?: "number" | "currency"
}) => {
    const formatValue = (val: number) => {
        if (format === "currency") {
            return `₦${val.toLocaleString()}`
        }
        return val.toLocaleString()
    }

    const getTrendIcon = () => {
        if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
        if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />
        return null
    }

    const getTrendColor = () => {
        if (trend === "up") return "text-green-500"
        if (trend === "down") return "text-destructive"
        return "text-muted-foreground"
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatValue(value)}</div>
                {change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(change)}% from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const DashboardOverview = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">Overview</h1>
                <Button variant="outline">Export Report</Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <KPICard
                    title="Total Invoices (This Term)"
                    value={kpiData.totalInvoices.value}
                    change={kpiData.totalInvoices.change}
                    trend={kpiData.totalInvoices.trend as TrendDirection}
                    icon={FileText}
                />
                <KPICard
                    title="Total Payments Received"
                    value={kpiData.totalPayments.value}
                    change={kpiData.totalPayments.change}
                    trend={kpiData.totalPayments.trend as TrendDirection}
                    icon={CreditCard}
                    format="currency"
                />
                <KPICard
                    title="Outstanding Balance"
                    value={kpiData.outstandingBalance.value}
                    change={kpiData.outstandingBalance.change}
                    trend={kpiData.outstandingBalance.trend as TrendDirection}
                    icon={DollarSign}
                    format="currency"
                />
                <KPICard
                    title="Scholarships Awarded"
                    value={kpiData.scholarshipsAwarded.value}
                    change={kpiData.scholarshipsAwarded.change}
                    trend={kpiData.scholarshipsAwarded.trend as TrendDirection}
                    icon={GraduationCap}
                    format="currency"
                />
                <KPICard
                    title="Payroll Due"
                    value={kpiData.payrollDue.value}
                    change={kpiData.payrollDue.change}
                    trend={kpiData.payrollDue.trend as TrendDirection}
                    icon={Users}
                    format="currency"
                />
                <KPICard
                    title="Overdue Invoices"
                    value={kpiData.overdueInvoices.value}
                    change={kpiData.overdueInvoices.change}
                    trend={kpiData.overdueInvoices.trend as TrendDirection}
                    icon={AlertTriangle}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Income vs Expenses Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses (6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, ""]} />
                                <Bar dataKey="income" fill="var(--chart-1)" name="Income" />
                                <Bar dataKey="expenses" fill="var(--chart-2)" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payment Methods Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {paymentMethodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Invoices</CardTitle>
                    <Button variant="outline" size="sm">
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentInvoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{invoice.student}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {invoice.class} • {invoice.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-medium">₦{invoice.amount.toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            invoice.status === "paid"
                                                ? "default"
                                                : invoice.status === "pending"
                                                    ? "secondary"
                                                    : invoice.status === "overdue"
                                                        ? "destructive"
                                                        : "outline"
                                        }
                                    >
                                        {invoice.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Alerts */}
            <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Financial Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm">• 23 invoices are overdue and require immediate attention</p>
                        <p className="text-sm">• 5 payments failed and need to be reconciled</p>
                        <p className="text-sm">• Staff salary payments are due in 3 days</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardOverview