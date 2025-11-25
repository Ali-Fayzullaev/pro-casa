'use client';

import { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  downPayment: number;
}

export default function CalculatorPage() {
  const [price, setPrice] = useState('30000000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [rate, setRate] = useState('14');
  const [years, setYears] = useState('15');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMortgage = () => {
    const priceNum = parseFloat(price);
    const downPercent = parseFloat(downPaymentPercent);
    const rateNum = parseFloat(rate);
    const yearsNum = parseFloat(years);

    if (!priceNum || !rateNum || !yearsNum) return;

    // Первоначальный взнос
    const downPayment = (priceNum * downPercent) / 100;
    
    // Сумма кредита
    const loanAmount = priceNum - downPayment;
    
    // Месячная ставка
    const monthlyRate = rateNum / 100 / 12;
    
    // Количество месяцев
    const months = yearsNum * 12;
    
    // Аннуитетный платеж
    const monthlyPayment = 
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    // Общая сумма выплат
    const totalPayment = monthlyPayment * months;
    
    // Переплата
    const totalInterest = totalPayment - loanAmount;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
      downPayment,
    });
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Ипотечный калькулятор
        </h1>
        <p className="text-muted-foreground mt-1">
          Рассчитайте ежемесячный платеж и переплату по ипотеке
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Форма расчета */}
        <Card>
          <CardHeader>
            <CardTitle>Параметры кредита</CardTitle>
            <CardDescription>
              Введите данные для расчета ипотеки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Стоимость квартиры
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="30000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {price && formatMoney(parseFloat(price))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Первоначальный взнос (%)
              </Label>
              <Select value={downPaymentPercent} onValueChange={setDownPaymentPercent}>
                <SelectTrigger id="downPayment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
              {price && (
                <p className="text-xs text-muted-foreground">
                  {formatMoney((parseFloat(price) * parseFloat(downPaymentPercent)) / 100)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Годовая процентная ставка
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                placeholder="14"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{rate}% годовых</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="years" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Срок кредита
              </Label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger id="years">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 лет</SelectItem>
                  <SelectItem value="10">10 лет</SelectItem>
                  <SelectItem value="15">15 лет</SelectItem>
                  <SelectItem value="20">20 лет</SelectItem>
                  <SelectItem value="25">25 лет</SelectItem>
                  <SelectItem value="30">30 лет</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculateMortgage} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Рассчитать
            </Button>
          </CardContent>
        </Card>

        {/* Результат расчета */}
        <Card>
          <CardHeader>
            <CardTitle>Результат расчета</CardTitle>
            <CardDescription>
              {result ? 'Ваш ежемесячный платеж и условия' : 'Заполните форму и нажмите "Рассчитать"'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Ежемесячный платеж */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ежемесячный платеж
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatMoney(result.monthlyPayment)}
                  </p>
                </div>

                {/* Детали */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Стоимость квартиры
                    </span>
                    <span className="font-medium">
                      {formatMoney(parseFloat(price))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Первоначальный взнос
                    </span>
                    <span className="font-medium">
                      {formatMoney(result.downPayment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Сумма кредита
                    </span>
                    <span className="font-medium">
                      {formatMoney(result.loanAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Срок кредита
                    </span>
                    <span className="font-medium">{years} лет ({parseFloat(years) * 12} мес.)</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Процентная ставка
                    </span>
                    <span className="font-medium">{rate}%</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Общая сумма выплат
                    </span>
                    <span className="font-medium">
                      {formatMoney(result.totalPayment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Переплата по кредиту
                    </span>
                    <span className="font-bold text-red-600">
                      {formatMoney(result.totalInterest)}
                    </span>
                  </div>
                </div>

                {/* Визуализация */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Основной долг</span>
                    <span>Проценты</span>
                  </div>
                  <div className="h-4 w-full rounded-full overflow-hidden flex">
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${(result.loanAmount / result.totalPayment) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${(result.totalInterest / result.totalPayment) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{((result.loanAmount / result.totalPayment) * 100).toFixed(1)}%</span>
                    <span>{((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Введите параметры и нажмите "Рассчитать"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Информация */}
      <Card>
        <CardHeader>
          <CardTitle>О калькуляторе</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Аннуитетный платеж</strong> - это равный ежемесячный платеж, который включает
            в себя основной долг и проценты. В начале срока большая часть платежа идет на проценты,
            к концу - на погашение основного долга.
          </p>
          <p>
            <strong>Обратите внимание:</strong> Расчет является предварительным. Точные условия
            уточняйте в банке. Могут применяться дополнительные комиссии и страховки.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
