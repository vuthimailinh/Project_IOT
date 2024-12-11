<template>
  <div>
    <Toast />
    <div class="max-w-[1440px] flex flex-col mx-auto">
      <div class="flex gap-4 mb-4 mt-8">
        <Button label="Daily" @click="setChartDataDaily" />
        <Button label="Weekly" @click="setChartDataWeekly" />
      </div>
      <div class="card">
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-[30rem]" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
import * as StompJs from '@stomp/stompjs';
import api from "./api";
const stompClient = ref(null);
import { useToast } from "primevue/usetoast";
const toast = useToast();
const chartData = ref(null);
const chartOptions = ref(null);

const rawData = ref([]);

const showToast = (severity, summary, detail) => {
  toast.add({ severity: severity, summary: summary, detail: detail, life: 5000 });
};

const setChartDataDaily = async () => {
  const response = await api.dailyData();
  rawData.value = response;
}

const setChartDataWeekly = async () => {
  const response = await api.weeklyData();
  rawData.value = response;
}

const connectWebSocket = () => {
  stompClient.value = new StompJs.Client({
    brokerURL: 'wss://iot2-m96h.onrender.com/registration',
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
  const response = await api.dailyData();
  rawData.value = response
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
