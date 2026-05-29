class GerenciadorServicos {
    constructor() {
        this.init();
    }

    init() {
        this.atualizarListaServicos();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('formServico').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarServico();
        });
    }

    adicionarServico() {
        const nome = document.getElementById('nomeServico').value;
        const preco = parseFloat(document.getElementById('precoServico').value);
        const duracao = parseInt(document.getElementById('duracaoServico').value);
        const descricao = document.getElementById('descricaoServico').value;

        if (!nome || isNaN(preco) || isNaN(duracao)) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        const novoServico = {
            id: gerenciador.gerarId('barbearia_servicos'),
            nome: nome,
            preco: preco,
            duracao: duracao,
            descricao: descricao
        };

        gerenciador.adicionarItem('barbearia_servicos', novoServico);
        document.getElementById('formServico').reset();
        this.atualizarListaServicos();
        alert('Serviço adicionado com sucesso!');
    }

    excluirServico(id) {
        const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
        const temAgendamento = agendamentos.some(a => a.servicoId === id);
        
        if (temAgendamento) {
            alert('Este serviço possui agendamentos. Cancele-os primeiro.');
            return;
        }

        if (confirm('Deseja realmente excluir este serviço?')) {
            gerenciador.removerItem('barbearia_servicos', id);
            this.atualizarListaServicos();
        }
    }

    atualizarListaServicos() {
        const servicos = gerenciador.carregarDados('barbearia_servicos');
        const listaEl = document.getElementById('listaServicos');

        if (servicos.length === 0) {
            listaEl.innerHTML = '<div class="empty-state">💇 Nenhum serviço cadastrado</div>';
            return;
        }

        listaEl.innerHTML = servicos.map(servico => `
            <div class="servico-card">
                <div class="servico-header">
                    <span class="servico-nome">${servico.nome}</span>
                    <span class="servico-preco">R$ ${servico.preco.toFixed(2)}</span>
                </div>
                <div class="servico-info">
                    <div>⏱️ Duração: ${servico.duracao} minutos</div>
                    ${servico.descricao ? `<div>📝 ${servico.descricao}</div>` : ''}
                </div>
                <div class="servico-acoes">
                    <button class="btn-excluir-servico" onclick="servicoManager.excluirServico(${servico.id})">
                        ❌ Excluir Serviço
                    </button>
                </div>
            </div>
        `).join('');
    }
}

let servicoManager;
document.addEventListener('DOMContentLoaded', function() {
    servicoManager = new GerenciadorServicos();
});