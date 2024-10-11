import { fakerPT_BR } from '@faker-js/faker';
import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Testes da api de mercado', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com/mercado/';
  let mercadoId = '1';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  it('GET Todos', async () => {
    const resp = await p.spec().get(baseUrl).expectStatus(StatusCodes.OK);

    mercadoId = resp.body[0].id;
  });

  describe('Retorna um mercado especificado pelo ID.', () => {
    it('GET Mercado por ID SUCESSO', async () => {
      await p.spec().get(`${baseUrl}${mercadoId}`).expectStatus(StatusCodes.OK);
    });

    it('GET Mercado por ID ERRO', async () => {
      await p
        .spec()
        .get(`${baseUrl}xxxx`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('ID do Mercado deve ser um número inteiro');
    });
  });

  describe('POST - Adiciona um novo mercado', () => {
    it('Sucess', async () => {
      const andress = fakerPT_BR.location.streetAddress();
      const fullname = fakerPT_BR.person.fullName();
      await p
        .spec()
        .post(baseUrl)
        .withJson({
          cnpj: '17688656256879',
          endereco: andress,
          nome: fullname
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains(
          'adicionado com sucesso com todas as subcategorias iniciais vazias!'
        )
        .expectJson('novoMercado.nome', fullname)
        .expectJson('novoMercado.endereco', andress)
        .expectJson('novoMercado.cnpj', '17688656256879');
    });

    it('Error', async () => {
      await p
        .spec()
        .post(baseUrl)
        .withJson({
          cnpj: '17688656256879'
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('Nome é obrigatório')
        .expectBodyContains('Endereço é obrigatório');
    });
  });

  describe('GET - Retorna todos os produtos associados a um mercado específico', () => {
    it('SUCESSO', async () => {
      await p
        .spec()
        .get(`${baseUrl}${mercadoId}/produtos`)
        .expectStatus(StatusCodes.OK);
    });

    it('ERRO', async () => {
      await p
        .spec()
        .get(`${baseUrl}xxxx/produtos`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('ID do Mercado deve ser um número inteiro');
    });
  });
});
