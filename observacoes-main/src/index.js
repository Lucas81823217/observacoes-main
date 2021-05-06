const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

const observacoesPorLembreteId = {};
const {
    v4: uuidv4
} = require('uuid');

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes =
            observacoesPorLembreteId[observacao.lembreteId];
        const obsParaAtualizar = observacoes.find(o => o.id ===
            observacao.id)
        obsParaAtualizar.status = observacao.status;
        axios.post('http://192.168.16.1:10000/eventos', {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                lembreteId: observacao.lembreteId,
                status: observacao.status
            }
        }).catch((err) => {
            console.log("err", err);
        });
    }
}
app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) {}
    res.status(200).send({
        msg: "ok"
    });
});

//:id é um placeholder
//exemplo: /lembretes/123456/observacoes
app.put('/lembretes/:id/observacoes', async (req, res) => {
    const idObs = uuidv4();
    const {
        texto
    } = req.body;
    //req.params dá acesso à lista de parâmetros da URL
    const observacoesDoLembrete =
        observacoesPorLembreteId[req.params.id] || [];
    observacoesDoLembrete.push({
        id: idObs,
        texto,
        status: 'aguardando'
    });
    observacoesPorLembreteId[req.params.id] =
        observacoesDoLembrete;
    await axios.post('http://192.168.16.1:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs,
            texto,
            lembreteId: req.params.id,
            status: 'aguardando'
        }
    }).catch((err) => {
        console.log("err", err);
    });
    res.status(201).send(observacoesDoLembrete);
});
app.get('/lembretes/:id/observacoes', (req, res) => {
    res.send(observacoesPorLembreteId[req.params.id] || []);

});
app.listen(5000, (() => {
    console.log('Lembretes. Porta 5000');
}));