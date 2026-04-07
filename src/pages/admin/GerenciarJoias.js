import React, { useState } from 'react';

export default function GerenciarJoias() {
  const [form, setForm] = useState({ nome: '', preco: '', material: '' });
  const [estoque, setEstoque] = useState([]);

  const salvar = () => {
    setEstoque([...estoque, { ...form, id: Date.now() }]);
    setForm({ nome: '', preco: '', material: '' });
    alert("Peça cadastrada!");
  };

  const excluir = (id) => setEstoque(estoque.filter(j => j.id !== id));

  return (
    <div style={{ padding: '30px' }}>
      <h2>Painel de Gestão de Acervo</h2>
      
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
        <input placeholder="Preço" type="number" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} />
        <input placeholder="Material" value={form.material} onChange={e => setForm({...form, material: e.target.value})} />
        <button onClick={salvar} style={{ background: '#D4AF37' }}>Salvar Joia</button>
      </div>

      <table width="100%" border="1" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {estoque.map(j => (
            <tr key={j.id}>
              <td>{j.nome}</td>
              <td>R$ {j.preco}</td>
              <td>
                <button onClick={() => alert('Editar')}>Editar</button>
                <button onClick={() => excluir(j.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}