class GerenciadorFinanceiro {
    constructor() {
        this.dataAtual = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        document.getElementById('filtroDataFinanceiro').value = this.dataAtual;
        this.carregarAgendamentos();
        this.atualizarResumoFinanceiro();
        this.atualizarListaTransacoes();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('formPagamento').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarPagamento();
        });

        document.getElementById('filtroDataFinanceiro').addEventListener('change', (e) => {
            this.dataAtual = e.target.value;
            this.atualizarListaTransacoes();
        });
    }

    carregarAgendamentos() {
        const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
        const financeiro = gerenciador.carregarDados('barbearia_financeiro');
        const hoje = new Date().toISOString().split('T')[0];
        
        const agendamentosNaoPagos = agendamentos.filter(a => 
            a.data === hoje && 
            !financeiro.some(f => f.agendamentoId === a.id)
        );

        const select = document.getElementById('agendamentoPagamento');
        select.innerHTML = '<option value="">Selecione um agendamento</option>';
        
        agendamentosNaoPagos.forEach(agendamento => {
            const option = document.createElement('option');
            option.value = agendamento.id;
            option.textContent = `${agendamento.nomeCliente} - ${agendamento.nomeServico} (${agendamento.horario}) - R$ ${agendamento.valor.toFixed(2)}`;
            option.setAttribute('data-valor', agendamento.valor);
            option.setAttribute('data-cliente', agendamento.nomeCliente);
            option.setAttribute('data-servico', agendamento.nomeServico);
            select.appendChild(option);
        });
    }

    registrarPagamento() {
        const agendamentoId = parseInt(document.getElementById('agendamentoPagamento').value);
        const formaPagamento = document.getElementById('formaPagamento').value;

        if (!agendamentoId || !formaPagamento) {
            alert('Selecione o agendamento e a forma de pagamento!');
            return;
        }

        const select = document.getElementById('agendamentoPagamento');
        const option = select.options[select.selectedIndex];
        const valor = parseFloat(option.getAttribute('data-valor'));
        const nomeCliente = option.getAttribute('data-cliente');
        const nomeServico = option.getAttribute('data-servico');

        const novaTransacao = {
            id: gerenciador.gerarId('barbearia_financeiro'),
            agendamentoId: agendamentoId,
            valor: valor,
            formaPagamento: formaPagamento,
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR'),
            nomeCliente: nomeCliente,
            nomeServico: nomeServico
        };

        gerenciador.adicionarItem('barbearia_financeiro', novaTransacao);
        document.getElementById('formPagamento').reset();
        this.carregarAgendamentos();
        this.atualizarResumoFinanceiro();
        this.atualizarListaTransacoes();
        alert('Pagamento registrado com sucesso!');
    }

    atualizarResumoFinanceiro() {
        const hoje = new Date().toISOString().split('T')[0];
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const financeiro = gerenciador.carregarDados('barbearia_financeiro');

        const faturamentoHoje = financeiro
            .filter(f => f.data === hoje)
            .reduce((total, f) => total + f.valor, 0);

        const faturamentoMes = financeiro
            .filter(f => {
                const data = new Date(f.data);
                return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
            })
            .reduce((total, f) => total + f.valor, 0);

        document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2)}`;
        document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
    }

    atualizarListaTransacoes() {
        const financeiro = gerenciador.carregarDados('barbearia_financeiro');
        const transacoesDoDia = financeiro.filter(f => f.data === this.dataAtual);
        const listaEl = document.getElementById('listaTransacoes');

        if (transacoesDoDia.length === 0) {
            listaEl.innerHTML = '<div class="empty-state">💰 Nenhuma transação nesta data</div>';
            return;
        }

        const totalDia = transacoesDoDia.reduce((total, t) => total + t.valor, 0);

        listaEl.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px; color: var(--primary-color); font-weight: bold;">
                Total do dia: R$ ${totalDia.toFixed(2)}
            </div>
            ${transacoesDoDia.map(transacao => `
                <div class="transacao-card">
                    <div class="transacao-header">
                        <span class="transacao-valor">R$ ${transacao.valor.toFixed(2)}</span>
                        <span class="transacao-forma">${this.formatarFormaPagamento(transacao.formaPagamento)}</span>
                    </div>
                    <div class="transacao-info">
                        <div>👤 ${transacao.nomeCliente}</div>
                        <div>💇 ${transacao.nomeServico}</div>
                        <div>🕐 ${transacao.hora}</div>
                    </div>
                </div>
            `).join('')}
        `;
    }

    formatarFormaPagamento(forma) {
        const formas = {
            'dinheiro': '💵 Dinheiro',
            'cartao_credito': '💳 Crédito',
            'cartao_debito': '💳 Débito',
            'pix': '📱 PIX'
        };
        return formas[forma] || forma;
    }
}

let financeiroManager;
document.addEventListener('DOMContentLoaded', function() {
    financeiroManager = new GerenciadorFinanceiro();
});