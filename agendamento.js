class GerenciadorAgendamentos {
    constructor() {
        this.dataAtual = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        document.getElementById('dataAgendamento').value = this.dataAtual;
        this.carregarClientes();
        this.carregarServicos();
        this.gerarHorarios();
        this.atualizarListaAgendamentos();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('dataAgendamento').addEventListener('change', (e) => {
            this.dataAtual = e.target.value;
            this.atualizarListaAgendamentos();
        });

        document.getElementById('formAgendamento').addEventListener('submit', (e) => {
            e.preventDefault();
            this.realizarAgendamento();
        });
    }

    carregarClientes() {
        const clientes = gerenciador.carregarDados('barbearia_clientes');
        const select = document.getElementById('clienteSelect');
        select.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} - ${cliente.telefone}`;
            option.setAttribute('data-telefone', cliente.telefone);
            select.appendChild(option);
        });
    }

    carregarServicos() {
        const servicos = gerenciador.carregarDados('barbearia_servicos');
        const select = document.getElementById('servicoSelect');
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)} (${servico.duracao}min)`;
            select.appendChild(option);
        });
    }

    gerarHorarios() {
        const select = document.getElementById('horarioSelect');
        const horarios = [];
        for (let h = 8; h <= 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                horarios.push(hora);
            }
        }
        
        select.innerHTML = '<option value="">Selecione um horário</option>';
        horarios.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            select.appendChild(option);
        });
    }

    realizarAgendamento() {
        const clienteId = parseInt(document.getElementById('clienteSelect').value);
        const servicoId = parseInt(document.getElementById('servicoSelect').value);
        const horario = document.getElementById('horarioSelect').value;
        const observacao = document.getElementById('observacao').value;

        if (!clienteId || !servicoId || !horario) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
        const conflito = agendamentos.find(a => 
            a.data === this.dataAtual && a.horario === horario
        );

        if (conflito) {
            alert('Já existe um agendamento neste horário!');
            return;
        }

        const clientes = gerenciador.carregarDados('barbearia_clientes');
        const servicos = gerenciador.carregarDados('barbearia_servicos');
        const cliente = clientes.find(c => c.id === clienteId);
        const servico = servicos.find(s => s.id === servicoId);

        const novoAgendamento = {
            id: gerenciador.gerarId('barbearia_agendamentos'),
            clienteId: clienteId,
            servicoId: servicoId,
            data: this.dataAtual,
            horario: horario,
            observacao: observacao,
            status: 'confirmado',
            valor: servico.preco,
            nomeCliente: cliente.nome,
            nomeServico: servico.nome,
            telefoneCliente: cliente.telefone
        };

        gerenciador.adicionarItem('barbearia_agendamentos', novoAgendamento);
        document.getElementById('formAgendamento').reset();
        this.atualizarListaAgendamentos();
        alert('Agendamento realizado com sucesso!');
    }

    cancelarAgendamento(id) {
        if (confirm('Deseja realmente cancelar este agendamento?')) {
            gerenciador.removerItem('barbearia_agendamentos', id);
            this.atualizarListaAgendamentos();
        }
    }

    atualizarListaAgendamentos() {
        const agendamentos = gerenciador.carregarDados('barbearia_agendamentos');
        const agendamentosDoDia = agendamentos.filter(a => a.data === this.dataAtual);
        const listaEl = document.getElementById('listaAgendamentos');

        if (agendamentosDoDia.length === 0) {
            listaEl.innerHTML = '<div class="empty-state">📅 Nenhum agendamento para esta data</div>';
            return;
        }

        agendamentosDoDia.sort((a, b) => a.horario.localeCompare(b.horario));

        listaEl.innerHTML = agendamentosDoDia.map(agendamento => {
            const mensagemWhats = `Olá ${agendamento.nomeCliente}! Confirmação do agendamento: ${agendamento.nomeServico} dia ${agendamento.data} às ${agendamento.horario}. Barbearia Pro Agradece!`;
            const linkWhats = criarLinkWhatsApp(agendamento.telefoneCliente, mensagemWhats);

            return `
                <div class="agendamento-card">
                    <div class="agendamento-header">
                        <span class="agendamento-nome">${agendamento.nomeCliente}</span>
                        <span class="agendamento-horario">🕐 ${agendamento.horario}</span>
                    </div>
                    <div class="agendamento-info">
                        <div>💇 ${agendamento.nomeServico}</div>
                        <div>💰 R$ ${agendamento.valor.toFixed(2)}</div>
                        ${agendamento.observacao ? `<div>📝 ${agendamento.observacao}</div>` : ''}
                    </div>
                    <div class="agendamento-acoes">
                        <a href="${linkWhats}" target="_blank" class="btn-whatsapp">
                            📱 WhatsApp
                        </a>
                        <button class="btn-cancelar" onclick="agendamentoManager.cancelarAgendamento(${agendamento.id})">
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

let agendamentoManager;
document.addEventListener('DOMContentLoaded', function() {
    agendamentoManager = new GerenciadorAgendamentos();
});