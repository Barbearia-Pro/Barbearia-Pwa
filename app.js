class GerenciadorDados {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('barbearia_clientes')) {
            localStorage.setItem('barbearia_clientes', JSON.stringify([]));
        }
        if (!localStorage.getItem('barbearia_agendamentos')) {
            localStorage.setItem('barbearia_agendamentos', JSON.stringify([]));
        }
        if (!localStorage.getItem('barbearia_servicos')) {
            const servicosPadrao = [
                { id: 1, nome: 'Corte Masculino', preco: 30, duracao: 30 },
                { id: 2, nome: 'Barba', preco: 20, duracao: 20 },
                { id: 3, nome: 'Corte + Barba', preco: 45, duracao: 50 },
                { id: 4, nome: 'Hidratação', preco: 40, duracao: 40 }
            ];
            localStorage.setItem('barbearia_servicos', JSON.stringify(servicosPadrao));
        }
        if (!localStorage.getItem('barbearia_financeiro')) {
            localStorage.setItem('barbearia_financeiro', JSON.stringify([]));
        }
    }

    salvarDados(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    }

    carregarDados(chave) {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : [];
    }

    adicionarItem(chave, item) {
        const dados = this.carregarDados(chave);
        dados.push(item);
        this.salvarDados(chave, dados);
    }

    removerItem(chave, id) {
        let dados = this.carregarDados(chave);
        dados = dados.filter(item => item.id !== id);
        this.salvarDados(chave, dados);
    }

    gerarId(chave) {
        const dados = this.carregarDados(chave);
        return dados.length > 0 ? Math.max(...dados.map(item => item.id)) + 1 : 1;
    }
}

const gerenciador = new GerenciadorDados();

function atualizarResumoDiario() {
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
    const clientes = gerenciador.carregarDados('barbearia_clientes');
    const financeiro = gerenciador.carregarDados('barbearia_financeiro');

    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);
    const faturamentoHoje = financeiro
        .filter(f => f.data === hoje)
        .reduce((total, f) => total + f.valor, 0);

    const totalAgendamentosEl = document.getElementById('totalAgendamentos');
    const totalFaturamentoEl = document.getElementById('totalFaturamento');
    const totalClientesEl = document.getElementById('totalClientes');

    if (totalAgendamentosEl) totalAgendamentosEl.textContent = agendamentosHoje.length;
    if (totalFaturamentoEl) totalFaturamentoEl.textContent = `R$ ${faturamentoHoje.toFixed(2)}`;
    if (totalClientesEl) totalClientesEl.textContent = clientes.length;
}

function formatarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return `(${numeros.substring(0,2)}) ${numeros.substring(2,7)}-${numeros.substring(7)}`;
    }
    return telefone;
}

function criarLinkWhatsApp(telefone, mensagem) {
    const numeros = telefone.replace(/\D/g, '');
    const texto = encodeURIComponent(mensagem);
    return `https://wa.me/55${numeros}?text=${texto}`;
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarResumoDiario();
    setInterval(atualizarResumoDiario, 60000);
});