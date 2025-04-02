import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Generate data points for f(AGE) = 1 + mod(AGE - 18) functions
const generateData = (modBase) => {
    const data = [];

    for (let age = 1; age <= 100; age++) {
        // Calculate different mod variations
        const standardMod = Math.abs(age - 18);
        const moduloTenMod = (age - 18) % 10;
        const moduloFiveMod = (age - 18) % 5;

        const standardBenefit = 1 / (1 + standardMod);
        const moduloTenBenefit = 1 / (1 + Math.abs(moduloTenMod));
        const moduloFiveBenefit = 1 / (1 + Math.abs(moduloFiveMod));

        data.push({
            age: age,
            standardMod: standardMod,
            moduloTenMod: moduloTenMod,
            moduloFiveMod: moduloFiveMod,
            standardBenefit: Number(standardBenefit.toFixed(4)),
            moduloTenBenefit: Number(moduloTenBenefit.toFixed(4)),
            moduloFiveBenefit: Number(moduloFiveBenefit.toFixed(4))
        });
    }
    return data;
};

export default function ModFunctionChart() {
    const data = generateData();

    return (
        <div className="w-full h-[800px] p-4">
            <h2 className="text-center text-xl font-bold mb-4">Funkcje MOD różnych typów</h2>

            <ResponsiveContainer width="100%" height="30%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="age"
                        label={{ value: 'Wiek', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis
                        label={{ value: 'Wartość MOD', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="standardMod"
                        stroke="#8884d8"
                        name="Wartość bezwzględna |AGE - 18|"
                    />
                    <Line
                        type="monotone"
                        dataKey="moduloTenMod"
                        stroke="#82ca9d"
                        name="MOD(AGE - 18, 10)"
                    />
                    <Line
                        type="monotone"
                        dataKey="moduloFiveMod"
                        stroke="#ff7300"
                        name="MOD(AGE - 18, 5)"
                    />
                </LineChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="30%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="age"
                        label={{ value: 'Wiek', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis
                        label={{ value: 'Korzyść', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="standardBenefit"
                        stroke="#8884d8"
                        name="Korzyść (standardowa)"
                    />
                    <Line
                        type="monotone"
                        dataKey="moduloTenBenefit"
                        stroke="#82ca9d"
                        name="Korzyść (MOD 10)"
                    />
                    <Line
                        type="monotone"
                        dataKey="moduloFiveBenefit"
                        stroke="#ff7300"
                        name="Korzyść (MOD 5)"
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="text-center mt-4">
                <h3 className="font-bold">Wzory funkcji MOD</h3>
                <ul className="list-disc list-inside text-left inline-block">
                    <li>f(x) = 1 + |x - 18|</li>
                    <li>f(x) = 1 + mod(x - 18, 10)</li>
                    <li>f(x) = 1 + mod(x - 18, 5)</li>
                </ul>
                <p className="mt-2">Różne sposoby obliczania MOD:</p>
                <ul className="list-disc list-inside text-left inline-block">
                    <li>Wartość bezwzględna: |x - 18|</li>
                    <li>Modulo 10: reszta z dzielenia przez 10</li>
                    <li>Modulo 5: reszta z dzielenia przez 5</li>
                </ul>
            </div>
        </div>
    );
}
