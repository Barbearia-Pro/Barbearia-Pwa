class GerenciadorClientes {
    constructor() {
        this.init();
    }

    init() {
        this.atualizarListaClientes();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('formCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.cadastrarCliente();
        });

        document.getElementById('telefoneCliente').addEventListener('input', (e) => {
            e.target.value = this.formatarTelefoneInput(e.target.value);
        });

        document.getElementById('buscaCliente').addEventListener('input', (e) => {
            this.filtrarClientes(e.target.value);
        });
    }

    formatarTelefoneInput(valor) {
        let numeros = valor.replace(/\D/g, '');
        if (numeros.length > 11) numeros = numeros.slice(0, 11);
        
        if (numeros.length > 2 && numeros.length <= 7) {
            return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
        } else if (numeros.length > 7) {
            return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
        } else if (numeros.length > 0) {
            return `(${numeros.slice(0,2)}`;
        }
        return numeros;
    }

    cadastrarCliente() {
        const nome = document.getElementById('nomeCliente').value;
        const telefone = document.getElementById('telefoneCliente').value;
        const email = document.getElementById('emailCliente').value;
        const nascimento = document.getElementById('nascimentoCliente').value;
        const observacao = document.getElementById('observacaoCliente').value;

        if (!nome || !telefone) {
            alert('Nome e telefone são obrigatórios!');
            return;
        }

        const novoCliente = {
            id: gerenciador.gerarId('barbearia_clientes'),
            nome: nome,
            telefone: telefone,
            email: email,
            nascimento: nascimento,
            observacao: observacao,
            dataCadastro: new Date().toISOString()
        };

        gerenciador.adicionarItem('barbearia_clientes', novoCliente);
        document.getElementById('formCliente').reset();
        this.atualizarListaClientes();
        alert('Cliente cadastrado com sucesso!');
    }

    excluirCliente(id) {
        const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
        const temAgendamento = agendamentos.some(a => a.clienteId === id);
        
        if (temAgendamento) {
            alert('Este cliente possui agendamentos. Cancele-os primeiro.');
            return;
        }

        if (confirm('Deseja realmente excluir este cliente?')) {
            gerenciador.removerItem('barbearia_clientes', id);
            this.atualizarListaClientes();
        }
    }

    filtrarClientes(termo) {
        const clientes = gerenciador.carregarDados('barbearia_clientes');
        const filtrados = clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
            cliente.telefone.includes(termo) ||
            (cliente.email && cliente.email.toLowerCase().includes(termo.toLowerCase()))
        );
        this.renderizarClientes(filtrados);
    }

    atualizarListaClientes() {
        const clientes = gerenciador.carregarDados('barbearia_clientes');
        this.renderizarClientes(clientes);
    }

    renderizarClientes(clientes) {
        const listaEl = document.getElementById('listaClientes');

        if (clientes.length === 0) {
            listaEl.innerHTML = '<div class="empty-state">👥 Nenhum cliente cadastrado</div>';
            return;
        }

        listaEl.innerHTML = clientes.map(cliente => {
            const mensagemWhats = `Olá ${cliente.nome}! Aqui é da Barbearia Pro. Como posso ajudar?`;
            const linkWhats = criarLinkWhatsApp(cliente.telefone, mensagemWhats);

            return `
                <div class="cliente-card">
                    <div class="cliente-header">
                        <span class="cliente-nome">${cliente.nome}</span>
                        <span class="cliente-telefone">📱 ${cliente.telefone}</span>
                    </div>
                    <div class="cliente-info">
                        ${cliente.email ? `<div>📧 ${cliente.email}</div>` : ''}
                        ${cliente.nascimento ? `<div>🎂 ${new Date(cliente.nascimento).toLocaleDateString('pt-BR')}</div>` : ''}
                        ${cliente.observacao ? `<div>📝 ${cliente.observacao}</div>` : ''}
                        <div>📅 Cadastrado em: ${new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div class="cliente-acoes">
                        <a href="${linkWhats}" target="_blank" class="btn-whatsapp-cliente">
                            📱 WhatsApp
                        </a>
                        <button class="btn-excluir" onclick="clienteManager.excluirCliente(${cliente.id})">
                            ❌ Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

let clienteManager;
document.addEventListener('DOMContentLoaded', function() {
    clienteManager = new GerenciadorClientes();
});