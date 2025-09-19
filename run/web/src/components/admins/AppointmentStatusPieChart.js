import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AppointmentStatusPieChart = ({ appointments }) => {
    // Calculate counts for each status
    const statusCounts = appointments.reduce(
        (acc, appointment) => {
            const status = appointment.status?.toUpperCase() || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        { COMPLETED: 0, CANCELLED: 0, MISSED: 0, UNKNOWN: 0 }
    );

    // Calculate total appointments
    const total = appointments.length || 1; // Avoid division by zero

    // Calculate percentages for the pie chart segments
    const percentages = {
        COMPLETED: ((statusCounts.COMPLETED / total) * 100).toFixed(1),
        CANCELLED: ((statusCounts.CANCELLED / total) * 100).toFixed(1),
        MISSED: ((statusCounts.MISSED / total) * 100).toFixed(1),
    };

    // Chart.js data
    const data = {
        labels: [ 'COMPLETED', 'CANCELLED', 'MISSED'],
        datasets: [
            {
                data: [
                    percentages.COMPLETED,
                    percentages.CANCELLED,
                    percentages.MISSED,
                ],
                backgroundColor: [ '#1ab909ff', '#CC0033', '#FFFF00'],
                hoverBackgroundColor: [ '#1ab909ff', '#CC0033', '#FFFF00'],
            },
        ],
    };

    // Chart.js options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    generateLabels: (chart) => {
                        const { data } = chart;
                        const counts = [
                            statusCounts.COMPLETED,
                            statusCounts.CANCELLED,
                            statusCounts.MISSED,
                        ];
                        return data.labels.map((label, index) => ({
                            text: `${label} (${counts[index]})`,
                            fillStyle: data.datasets[0].backgroundColor[index],
                            strokeStyle: data.datasets[0].backgroundColor[index],
                            hidden: !chart.getDataVisibility(index),
                            index,
                        }));
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}%`;
                    },
                },
            },
        },
    };

    return (
        <div className="chart">
            <h2>Appointment Status Distribution</h2>
            <div style={{ height: '250px', width: '100%' }}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default AppointmentStatusPieChart;