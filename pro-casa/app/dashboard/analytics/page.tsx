'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Home, DollarSign, Calendar, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api-client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Загрузка аналитики...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Аналитика
        </h1>
        <p className="text-muted-foreground mt-1">
          Обзор ключевых показателей и эффективности
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные объекты</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.activeDeals}</div>
            <p className="text-xs text-muted-foreground">В продаже</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прогноз комиссии</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(data.kpi.commissionForecast)}</div>
            <p className="text-xs text-muted-foreground">По активным сделкам (2%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Горячие лиды</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.hotLeads}</div>
            <p className="text-xs text-muted-foreground">Активные покупатели</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">В успешную сделку</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin: Brokers Performance */}
      {data.brokersPerformance && (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Эффективность команды</CardTitle>
            <CardDescription>Показатели работы брокеров</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Брокер</th>
                    <th className="p-3 font-medium text-center">Объектов</th>
                    <th className="p-3 font-medium text-center">Активные</th>
                    <th className="p-3 font-medium text-center">Сделки</th>
                    <th className="p-3 font-medium text-right">Прогноз (KZT)</th>
                    <th className="p-3 font-medium text-right">Конверсия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.brokersPerformance.map((broker: any) => (
                    <tr key={broker.id} className="hover:bg-muted/10">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {broker.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {broker.name}
                      </td>
                      <td className="p-3 text-center">{broker.totalProperties}</td>
                      <td className="p-3 text-center font-semibold text-blue-600">{broker.activeProperties}</td>
                      <td className="p-3 text-center font-bold text-green-600">{broker.completedDeals}</td>
                      <td className="p-3 text-right text-muted-foreground">{formatMoney(broker.commissionForecast)}</td>
                      <td className="p-3 text-right">
                        <Badge variant={broker.conversionRate > 10 ? "default" : "secondary"}>
                          {broker.conversionRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Funnel Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Воронка продаж</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.funnel}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.activity.map((item: any) => (
                <div className="flex items-center" key={item.id}>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {data.activity.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Нет активности
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sold Deals Section */}
      {data.soldDeals && data.soldDeals.length > 0 && (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Закрытые сделки
            </CardTitle>
            <CardDescription>
              Успешно проданные объекты
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-green-50 text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Объект</th>
                    <th className="p-3 font-medium">Продавец</th>
                    <th className="p-3 font-medium">Покупатель</th>
                    <th className="p-3 font-medium text-right">Цена продажи</th>
                    <th className="p-3 font-medium text-right">Комиссия (2%)</th>
                    <th className="p-3 font-medium">Дата</th>
                    {data.brokersPerformance && (
                      <th className="p-3 font-medium">Брокер</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.soldDeals.map((deal: any) => (
                    <tr key={deal.id} className="hover:bg-green-50/50">
                      <td className="p-3">
                        <div className="font-medium">{deal.residentialComplex}</div>
                        <div className="text-xs text-muted-foreground">{deal.address}</div>
                      </td>
                      <td className="p-3">{deal.seller}</td>
                      <td className="p-3">{deal.buyer}</td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {formatMoney(deal.finalPrice)}
                      </td>
                      <td className="p-3 text-right font-bold text-green-700">
                        {formatMoney(deal.commission)}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(deal.closedAt).toLocaleDateString('ru-RU')}
                      </td>
                      {data.brokersPerformance && (
                        <td className="p-3">
                          <Badge variant="secondary">{deal.broker}</Badge>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
