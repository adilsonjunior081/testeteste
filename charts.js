/**
 * Agricultura de Gravatá - JavaScript de Gráficos
 */

// Importar Chart.js se não estiver disponível no escopo global
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Plugin de datalabels
    const datalabelsScript = document.createElement('script');
    datalabelsScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0';
    datalabelsScript.async = true;
    document.head.appendChild(datalabelsScript);
}

// Registrar o plugin ChartDataLabels globalmente
let ChartDataLabels;
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o plugin está disponível
    if (window.ChartDataLabels) {
        ChartDataLabels = window.ChartDataLabels;
    } else {
        console.warn('Plugin ChartDataLabels não encontrado. Os rótulos podem não ser exibidos corretamente.');
    }
});

// Variáveis globais para armazenar os dados e gráficos
let productionData = null;
let productionDataByYear = null;
let distributionData = null;
let economicImpactData = null;
let productionChart = null;
let distributionChart = null;
let economicImpactChart = null;
let isFullscreen = false;

// Carrega os dados do arquivo JSON
async function loadChartData() {
    try {
        console.log('Tentando carregar dados de production.json...');
        // Tentando com caminho relativo à raiz do site
        let response = await fetch('./data/production.json');
        
        if (!response.ok) {
            console.log('Primeira tentativa falhou, tentando caminho alternativo...');
            // Tentativa alternativa com caminho relativo ao JS
            response = await fetch('../data/production.json');
        }
        
        if (!response.ok) {
            // Uma terceira tentativa com um caminho absoluto
            console.log('Segunda tentativa falhou, tentando caminho absoluto...');
            response = await fetch('/data/production.json');
            
            if (!response.ok) {
                // Tentativa final com production.json na raiz
                response = await fetch('production.json');
            }
        }
        
        if (!response.ok) {
            throw new Error('Não foi possível carregar o arquivo production.json');
        }
        
        console.log('Dados carregados com sucesso!');
        const data = await response.json();
        
        console.log('Labels dos meses:', data.productionData.labels);
        console.log('Total de meses:', data.productionData.labels.length);
        console.log('Datasets carregados:', data.productionData.datasets.length);
        
        // Garantir que todos os datasets tenham as propriedades necessárias
        data.productionData.datasets.forEach(dataset => {
            if (!dataset.borderWidth) dataset.borderWidth = 2;
            if (dataset.fill === undefined) dataset.fill = false;
            if (!dataset.tension) dataset.tension = 0.4;
        });
        
        // Garantir que os dados por ano estejam estruturados corretamente
        if (data.productionDataByYear && data.productionDataByYear['2023']) {
            data.productionDataByYear['2023'].datasets.forEach(dataset => {
                if (!dataset.borderWidth) dataset.borderWidth = 2;
                if (dataset.fill === undefined) dataset.fill = false;
                if (!dataset.tension) dataset.tension = 0.4;
            });
        }
        
        if (data.productionDataByYear && data.productionDataByYear['2024']) {
            data.productionDataByYear['2024'].datasets.forEach(dataset => {
                if (!dataset.borderWidth) dataset.borderWidth = 2;
                if (dataset.fill === undefined) dataset.fill = false;
                if (!dataset.tension) dataset.tension = 0.4;
            });
        }
        
        productionData = data.productionData;
        productionDataByYear = data.productionDataByYear || {};
        
        // Garantir que os dados para cada ano estejam definidos
        if (!productionDataByYear['2023']) {
            console.warn('Dados de 2023 não encontrados, criando estrutura vazia');
            productionDataByYear['2023'] = {
                labels: productionData.labels,
                datasets: []
            };
        }
        
        if (!productionDataByYear['2024']) {
            console.warn('Dados de 2024 não encontrados, criando estrutura vazia');
            productionDataByYear['2024'] = {
                labels: productionData.labels,
                datasets: []
            };
        }
        
        // Garantir que 'all' tenha a estrutura correta
        productionDataByYear['all'] = productionData;
        
        distributionData = data.distributionData;
        
        // Inicializa os gráficos depois de carregar os dados
        initCharts();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Tentar carregar dados diretamente do JSON inline para garantir funcionamento
        alert('Erro ao carregar dados de produção. Utilizando dados de demonstração.');
        
        // Criar dados de demonstração
        createDemoData();
        
        // Inicializar gráficos com dados de demonstração
        initCharts();
    }
}

// Função para criar dados de demonstração caso o carregamento falhe
function createDemoData() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Dados de produção para 2023
    const production2023Data = {
        labels: months,
        datasets: [
            {
                label: 'Banana',
                data: [120, 140, 130, 150, 160, 170, 165, 155, 180, 190, 185, 195],
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Goiaba',
                data: [80, 90, 85, 95, 100, 105, 110, 100, 95, 105, 110, 115],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };
    
    // Dados de produção para 2024
    const production2024Data = {
        labels: months,
        datasets: [
            {
                label: 'Banana',
                data: [200, 210, 205, 215, 225, 230, 240, 235, 250, 260, 265, 270],
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Goiaba',
                data: [120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Abacaxi',
                data: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };
    
    // Definir dados padrão para o gráfico (usando 2023)
    productionData = production2023Data;
    
    // Definir dados por ano
    productionDataByYear = {
        '2023': production2023Data,
        '2024': production2024Data
    };
    
    // Dados de distribuição
    distributionData = {
        labels: ['Banana', 'Goiaba', 'Abacaxi', 'Chuchu', 'Inhame'],
        datasets: [{
            data: [40, 25, 15, 10, 10],
            backgroundColor: [
                '#FFC107',
                '#4CAF50',
                '#2196F3',
                '#9C27B0',
                '#FF5722'
            ],
            borderWidth: 1
        }]
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se os elementos dos gráficos existem
    const productionChartElement = document.getElementById('productionChart');
    const distributionChartElement = document.getElementById('distributionChart');
    
    if (!productionChartElement && !distributionChartElement) {
        return; // Sair se nenhum dos elementos existir
    }
    
    console.log('Iniciando carregamento dos gráficos...');
    
    // Carregar dados estáticos (dados fixos já no código)
    loadStaticData();
    
    // Inicializar os gráficos
    initCharts();
    
    // Configurar filtros para o gráfico de produção
    initChartFilters();
    
    // Adicionar função de depuração para os botões
    setupButtonDebug();
    
    // Garantir que o botão "2023" seja ativo após a inicialização completa
    setTimeout(function() {
        const button2023 = document.querySelector('.chart-filter-btn[data-year="2023"]');
        if (button2023) {
            console.log('Verificando se o botão "2023" está ativado após carregamento');
            
            if (!button2023.classList.contains('active')) {
                console.log('Aplicando classe active ao botão "2023"');
                
                // Forçar a classe active no botão 2023
                document.querySelectorAll('.chart-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                button2023.classList.add('active');
            }
        }
    }, 500);
});

// Função para configurar depuração dos botões
function setupButtonDebug() {
    console.log('Configurando depuração para os botões de filtro...');
    
    // Obter referências específicas aos botões por ID
    const btn2023 = document.getElementById('btn-year-2023');
    const btn2024 = document.getElementById('btn-year-2024');
    
    // Verificar se os botões foram encontrados
    if (btn2023) {
        console.log('Botão 2023 encontrado:', btn2023.outerHTML);
        console.log('Botão 2023 está ativo?', btn2023.classList.contains('active'));
    } else {
        console.error('Botão 2023 não encontrado!');
    }
    
    if (btn2024) {
        console.log('Botão 2024 encontrado:', btn2024.outerHTML);
        console.log('Botão 2024 está ativo?', btn2024.classList.contains('active'));
    } else {
        console.error('Botão 2024 não encontrado!');
    }
    
    // Adicionar cliques de teste programaticamente
    if (btn2023 && btn2024) {
        console.log('Adicionando eventos de teste aos botões...');
        
        // Forçar a aplicação da classe active ao botão 2023
        btn2023.classList.add('active');
        btn2024.classList.remove('active');
        
        // Adicionar cliques extras para garantir que funcionem
        btn2023.addEventListener('click', function() {
            console.log('Clique direto no botão 2023');
            // Garantir que os outros eventos sejam acionados
        });
        
        btn2024.addEventListener('click', function() {
            console.log('Clique direto no botão 2024');
            // Garantir que os outros eventos sejam acionados
        });
    }
}

// Carregar dados estáticos para os gráficos
function loadStaticData() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Dados para 2023
    const data2023 = {
        labels: months,
        datasets: [
            {
                label: 'Abacaxi',
                data: [110, 120, 115, 130, 150, 145, 140, 160, 170, 180, 175, 185],
                backgroundColor: '#FC9F1C',
                borderColor: '#FC9F1C',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Banana',
                data: [80, 75, 85, 90, 100, 105, 110, 115, 120, 110, 105, 100],
                backgroundColor: '#2CB1A3',
                borderColor: '#2CB1A3',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Goiaba',
                data: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105],
                backgroundColor: '#EB3C3B',
                borderColor: '#EB3C3B',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Cará',
                data: [40, 45, 48, 52, 58, 63, 68, 70, 75, 78, 75, 70],
                backgroundColor: '#60442F',
                borderColor: '#60442F',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Chuchu',
                data: [25, 30, 35, 40, 45, 50, 55, 60, 63, 60, 55, 52],
                backgroundColor: '#8a6344',
                borderColor: '#8a6344',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Orgânicos',
                data: [12, 15, 18, 22, 26, 30, 35, 40, 43, 45, 42, 38],
                backgroundColor: '#5ec8bd',
                borderColor: '#5ec8bd',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };
    
    // Dados para 2024
    const data2024 = {
        labels: months,
        datasets: [
            {
                label: 'Abacaxi',
                data: [130, 140, 135, 150, 170, 165, 160, 180, 190, 200, 195, 205],
                backgroundColor: '#FC9F1C',
                borderColor: '#FC9F1C',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Banana',
                data: [100, 95, 105, 110, 120, 125, 130, 135, 140, 130, 125, 120],
                backgroundColor: '#2CB1A3',
                borderColor: '#2CB1A3',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Goiaba',
                data: [70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125],
                backgroundColor: '#EB3C3B',
                borderColor: '#EB3C3B',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Cará',
                data: [50, 55, 58, 63, 68, 75, 80, 85, 88, 90, 85, 80],
                backgroundColor: '#60442F',
                borderColor: '#60442F',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Chuchu',
                data: [35, 40, 45, 50, 55, 60, 65, 70, 75, 73, 70, 65],
                backgroundColor: '#8a6344',
                borderColor: '#8a6344',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Orgânicos',
                data: [18, 22, 25, 30, 35, 40, 45, 50, 55, 58, 54, 50],
                backgroundColor: '#5ec8bd',
                borderColor: '#5ec8bd',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };
    
    // Dados para gráfico de distribuição
    const distData = {
        labels: ['Abacaxi', 'Banana', 'Cará', 'Chuchu', 'Goiaba', 'Orgânicos'],
        datasets: [{
            label: 'Área em Hectares',
            data: [750, 450, 275, 200, 225, 175],
            backgroundColor: [
                '#FC9F1C',
                '#2CB1A3',
                '#60442F',
                '#8a6344',
                '#EB3C3B',
                '#5ec8bd'
            ],
            borderWidth: 1
        }]
    };
    
    // Dados para gráfico de impacto econômico
    const economicData = {
        labels: ['Flores', 'Abacaxi', 'Banana', 'Chuchu', 'Cará São Tomé', 'Goiaba', 'Orgânicos'],
        datasets: [{
            label: 'Impacto Econômico (Milhões R$)',
            data: [50, 30, 30, 30, 30, 30, 30],
            backgroundColor: [
                '#FF6384', // Flores
                '#FC9F1C', // Abacaxi
                '#2CB1A3', // Banana
                '#8a6344', // Chuchu
                '#60442F', // Cará
                '#EB3C3B', // Goiaba
                '#5ec8bd'  // Orgânicos
            ],
            borderColor: [
                '#FF6384',
                '#FC9F1C',
                '#2CB1A3',
                '#8a6344',
                '#60442F',
                '#EB3C3B',
                '#5ec8bd'
            ],
            borderWidth: 1
        }]
    };
    
    // Armazenar dados nas variáveis globais
    productionData = data2023;  // Usar 2023 como padrão
    productionDataByYear = {
        '2023': data2023,
        '2024': data2024
    };
    distributionData = distData;
    economicImpactData = economicData;
}

// Inicializa todos os gráficos
function initCharts() {
    // Verificar se os elementos dos gráficos existem
    const productionChartEl = document.getElementById('productionChart');
    const distributionChartEl = document.getElementById('distributionChart');
    const economicImpactChartEl = document.getElementById('economicImpactChart');
    
    // Inicializar gráficos se existirem
    if (productionChartEl) {
        initProductionChart();
    }
    
    if (distributionChartEl) {
        initDistributionChart();
    }
    
    if (economicImpactChartEl) {
        initEconomicImpactChart();
    }
}

// Gráfico de Produção Mensal
function initProductionChart() {
    const ctx = document.getElementById('productionChart').getContext('2d');
    
    console.log('Inicializando gráfico de produção mensal...');
    
    // Adicionar botões de expandir e download
    const chartContainer = document.getElementById('productionChart-container');
    
    // Configurações do gráfico
    const config = {
        type: 'line',
        data: productionData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Toneladas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mês'
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + ' ton';
                        }
                    }
                },
                datalabels: {
                    display: false // Não exibir no gráfico de linha para evitar poluição visual
                }
            }
        },
        plugins: [ChartDataLabels]
    };
    
    // Criar gráfico
    productionChart = new Chart(ctx, config);
    window.productionChart = productionChart;
    
    // Adicionar botões ao container
    addChartButtons(chartContainer, productionChart, 'producao_agricola_gravata');
    
    console.log('Gráfico de produção inicializado');
}

// Gráfico de Distribuição de Área
function initDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    // Configurações do gráfico
    const config = {
        type: 'pie',
        data: distributionData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return label + ': ' + value + ' hectares (' + percentage + '%)';
                        }
                    }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage + '%';
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    display: true
                }
            }
        },
        plugins: [ChartDataLabels]
    };
    
    // Criar gráfico
    distributionChart = new Chart(ctx, config);
    window.distributionChart = distributionChart;
    
    // Adicionar botões ao container
    const chartContainer = document.getElementById('distributionChart-container');
    if (chartContainer) {
        addChartButtons(chartContainer, distributionChart, 'distribuicao_area_gravata');
    }
}

// Gráfico de Impacto Econômico
function initEconomicImpactChart() {
    const ctx = document.getElementById('economicImpactChart').getContext('2d');
    
    // Configurações do gráfico
    const config = {
        type: 'bar',
        data: economicImpactData,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Milhões de Reais (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value + ' M';
                        }
                    },
                    max: 60
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.raw + ' milhões';
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 4,
                    formatter: (value) => {
                        return 'R$ ' + value + ' M';
                    },
                    color: '#000',
                    font: {
                        weight: 'bold'
                    },
                    display: true
                }
            }
        },
        plugins: [ChartDataLabels]
    };
    
    // Criar gráfico
    economicImpactChart = new Chart(ctx, config);
    window.economicImpactChart = economicImpactChart;
    
    // Adicionar botões ao container
    const chartContainer = document.getElementById('economicImpactChart-container');
    if (chartContainer) {
        addChartButtons(chartContainer, economicImpactChart, 'impacto_economico_gravata');
    }
}

// Filtros para os gráficos
function initChartFilters() {
    console.log('Inicializando filtros para os gráficos...');
    
    // Obter os botões diretamente por ID para evitar problemas com seletores
    const btn2023 = document.getElementById('btn-year-2023');
    const btn2024 = document.getElementById('btn-year-2024');
    
    // Verificar se ambos os botões existem
    if (!btn2023 || !btn2024) {
        console.error('Botões de filtro não encontrados na página!');
        console.log('btn2023:', btn2023);
        console.log('btn2024:', btn2024);
        return;
    }
    
    console.log('Botões de filtro encontrados na página');
    
    // Verificar se o gráfico está disponível
    if (!productionChart) {
        console.error('Gráfico de produção não está inicializado');
        return;
    }
    
    // Verificar se os dados estão disponíveis
    if (!productionDataByYear || !productionDataByYear['2023'] || !productionDataByYear['2024']) {
        console.error('Dados de produção não estão disponíveis corretamente');
        console.log('Dados disponíveis:', productionDataByYear);
        return;
    }
    
    // Função para atualizar o gráfico com dados do ano especificado
    function updateChartWithYear(year) {
        console.log(`Atualizando gráfico para o ano ${year}...`);
        
        if (!productionDataByYear[year]) {
            console.error(`Dados para o ano ${year} não estão disponíveis!`);
            return;
        }
        
        // Atualizar dados do gráfico
        productionChart.data.labels = productionDataByYear[year].labels;
        productionChart.data.datasets = productionDataByYear[year].datasets;
        productionChart.update();
        
        console.log(`Gráfico atualizado para o ano ${year}`);
        console.log('Labels:', productionDataByYear[year].labels.length);
        console.log('Datasets:', productionDataByYear[year].datasets.length);
    }
    
    // Remover todos os eventos anteriores para evitar duplicação
    const newBtn2023 = btn2023.cloneNode(true);
    const newBtn2024 = btn2024.cloneNode(true);
    
    btn2023.parentNode.replaceChild(newBtn2023, btn2023);
    btn2024.parentNode.replaceChild(newBtn2024, btn2024);
    
    // Adicionar eventos aos clones
    newBtn2023.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botão 2023 clicado');
        
        // Atualizar classes de ativo
        newBtn2023.classList.add('active');
        newBtn2024.classList.remove('active');
        
        // Atualizar o gráfico
        updateChartWithYear('2023');
    });
    
    newBtn2024.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botão 2024 clicado');
        
        // Atualizar classes de ativo
        newBtn2024.classList.add('active');
        newBtn2023.classList.remove('active');
        
        // Atualizar o gráfico
        updateChartWithYear('2024');
    });
    
    // Aplicar dados de 2023 por padrão e garantir que o botão esteja ativo
    console.log('Aplicando dados iniciais de 2023...');
    newBtn2023.classList.add('active');
    newBtn2024.classList.remove('active');
    updateChartWithYear('2023');
}

// Adicionar botões de expandir e download a um container de gráfico
function addChartButtons(chartContainer, chart, filename) {
    // Criar container para os botões do gráfico
    const chartActions = document.createElement('div');
    chartActions.className = 'chart-actions';
    
    // Botão de expandir
    const expandBtn = document.createElement('button');
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    expandBtn.className = 'chart-action-btn';
    expandBtn.title = 'Expandir gráfico';
    
    // Botão de download
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
    downloadBtn.className = 'chart-action-btn';
    downloadBtn.title = 'Baixar gráfico';
    
    // Adicionar botões ao container
    chartActions.appendChild(expandBtn);
    chartActions.appendChild(downloadBtn);
    
    // Adicionar container ao gráfico
    chartContainer.style.position = 'relative';
    chartContainer.style.marginTop = '20px'; // Adicionar margem superior para acomodar os botões
    chartContainer.appendChild(chartActions);
    
    // Evento de clique para expandir o gráfico
    expandBtn.addEventListener('click', () => {
        toggleFullscreen(chartContainer, expandBtn, chart);
    });
    
    // Evento para download do gráfico
    downloadBtn.addEventListener('click', () => {
        downloadChart(chart, filename);
    });
    
    return chartActions;
}

// Função para alternar modo tela cheia
function toggleFullscreen(element, buttonElement, chart) {
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        // Criar div modal para tela cheia
        const modal = document.createElement('div');
        modal.id = 'chart-fullscreen-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '20px';
        
        // Adicionar botão de fechar
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '15px';
        closeButton.style.right = '15px';
        closeButton.style.background = '#EB3C3B'; // Cor vermelha para melhor visibilidade
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '50%';
        closeButton.style.width = '40px';
        closeButton.style.height = '40px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        closeButton.style.zIndex = '10000';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        
        // Criar container para o canvas em tela cheia
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '95%';
        chartContainer.style.height = '85%';
        chartContainer.style.position = 'relative';
        chartContainer.style.display = 'flex';
        chartContainer.style.alignItems = 'center';
        chartContainer.style.justifyContent = 'center';
        
        // Criar canvas para o gráfico em tela cheia
        const fullscreenCanvas = document.createElement('canvas');
        fullscreenCanvas.id = 'fullscreen-chart';
        fullscreenCanvas.style.maxWidth = '100%';
        fullscreenCanvas.style.maxHeight = '100%';
        
        chartContainer.appendChild(fullscreenCanvas);
        modal.appendChild(closeButton);
        modal.appendChild(chartContainer);
        document.body.appendChild(modal);
        
        // Alterar ícone do botão
        buttonElement.innerHTML = '<i class="fas fa-compress"></i>';
        
        // Criar novo gráfico no canvas em tela cheia
        const fullscreenCtx = fullscreenCanvas.getContext('2d');
        const fullscreenChart = new Chart(fullscreenCtx, {
            type: chart.config.type,
            data: chart.config.data,
            options: {
                ...chart.config.options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chart.config.options.plugins,
                    legend: {
                        ...chart.config.options.plugins.legend,
                        labels: {
                            ...chart.config.options.plugins.legend.labels,
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    ...chart.config.options.scales,
                    y: chart.config.options.scales?.y ? {
                        ...chart.config.options.scales.y,
                        title: chart.config.options.scales.y.title ? {
                            ...chart.config.options.scales.y.title,
                            font: {
                                size: 16
                            }
                        } : undefined
                    } : undefined,
                    x: chart.config.options.scales?.x ? {
                        ...chart.config.options.scales.x,
                        title: chart.config.options.scales.x.title ? {
                            ...chart.config.options.scales.x.title,
                            font: {
                                size: 16
                            }
                        } : undefined,
                        ticks: {
                            ...chart.config.options.scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    } : undefined
                }
            }
        });
        
        // Adicionar eventos para fechar
        closeButton.addEventListener('click', () => {
            toggleFullscreen(element, buttonElement, chart);
        });
        
        // Fechar ao pressionar ESC
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                toggleFullscreen(element, buttonElement, chart);
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    } else {
        // Remover modal e gráfico em tela cheia
        const modal = document.getElementById('chart-fullscreen-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
        
        // Restaurar ícone do botão
        buttonElement.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Função para baixar o gráfico como imagem
function downloadChart(chart, filename) {
    // Verificar se o chart existe
    if (!chart) {
        console.error('Gráfico não disponível para download');
        return;
    }
    
    // Criar link para download
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = chart.toBase64Image();
    link.click();
} 