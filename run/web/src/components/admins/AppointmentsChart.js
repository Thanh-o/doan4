import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AppointmentsChart = ({ appointments }) => {
    const groupAppointmentsByDay = (appointments) => {
        // Tạo mảng chứa 10 ngày gần nhất
        const days = Array.from({ length: 10 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (9 - i));
            return date.toLocaleDateString();
        });

        // Nhóm dữ liệu cuộc hẹn theo ngày
        const groupedData = appointments.reduce((acc, appointment) => {
            const date = new Date(appointment.medical_day).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Đảm bảo mỗi ngày đều có mặt trong mảng dữ liệu
        const labels = days;
        const data = labels.map(label => groupedData[label] || 0);

        return { labels, data };
    };


    const { labels, data } = groupAppointmentsByDay(appointments);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Appointments Quantity',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default AppointmentsChart;
