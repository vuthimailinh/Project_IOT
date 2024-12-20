<template>
    <div>
        <Toast />
        <div class="max-w-[1440px] flex flex-col mx-auto">
            <div class="flex gap-4 mb-4 mt-8">
                <Button label="Daily" @click="setChartDataDaily" />
                <Button label="Weekly" @click="setChartDataWeekly" />
            </div>
            <div class="mb-4 gap-4 flex items-center">
                <label for="">Device: </label>
                <Select v-model="device" :options="listDevices" optionLabel="name" placeholder="Select a Device"
                    class="w-full md:w-56" />

            </div>
            <!-- <div class="gap-x-4 flex items-center">
                <label for="">Search:</label>
                <DatePicker v-model="date" dateFormat="dd/mm/yy" />
                <label for="" class="flex justify-center items-center text-3xl"> ~ </label>
                <DatePicker v-model="date" dateFormat="dd/mm/yy" />
                <Button label="Search"></Button>
            </div> -->
            <div class="card">
                <Chart type="line" :data="chartData" :options="chartOptions" class="h-[30rem]" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
import * as StompJs from '@stomp/stompjs';
import api from "../api";
const stompClient = ref(null);
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const chartData = ref(null);
const chartOptions = ref(null);

const rawData = ref([]);
const listDevices = ref([]);
const value = ref("");
const device = ref()

const showToast = (severity, summary, detail) => {
    toast.add({ severity: severity, summary: summary, detail: detail, life: 5000 });
};

const setChartDataDaily = async () => {
    const response = await api.dailyData(device.value.deviceId);
    rawData.value = response;
}

const setChartDataWeekly = async () => {
    console.log(device.value.deviceId);
    const response = await api.weeklyData(device.value.deviceId);
    rawData.value = response;
}

const connectWebSocket = () => {
    stompClient.value = new StompJs.Client({
        brokerURL: import.meta.env.VITE_WEB_SOCKET,
        onConnect: () => {
            console.log('WebSocket connected');
            stompClient.value.subscribe('/topic/alert', (message) => {
                const alertData = JSON.parse(new TextDecoder().decode(message._binaryBody));
                console.log('Alert received:', alertData);
                showToast('warn', alertData.alert, alertData.alert);
            });
        },
        onStompError: (error) => {
            console.error('WebSocket Error:', error);
            showToast('error', 'Connection Error', 'Failed to connect to WebSocket server.');
        },
    });
    stompClient.value.activate();
};

const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const labels = rawData.value.map(item => {
        const date = new Date(item.time);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month} ${hours}:${minutes}`;
    });

    const data = rawData.value.map(item => item.soilMoistureValue);

    return {
        labels,
        datasets: [
            {
                label: 'Độ ẩm',
                data,
                fill: true,
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                backgroundColor: 'rgba(0, 188, 212, 0.2)',
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                },
                grid: {
                    color: surfaceBorder,
                },
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                },
                grid: {
                    color: surfaceBorder,
                },
            },
        },
    };
};

onMounted(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        router.push('/login');
    }
    listDevices.value = await api.listDevice();
    connectWebSocket();
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

watch(rawData, (newData) => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<style scoped>
.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.tabs button {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: none;
    cursor: pointer;
}

.tabs button.active {
    background-color: #007BFF;
    color: white;
}
</style>