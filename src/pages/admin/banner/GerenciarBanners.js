import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiCheckCircle, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';

import './GerenciarBanners.css';
import { ArquivoService } from '../../../services/ArquivoService';
import { BannerService } from '../../../services/BannerService';

// Ajuste essa URL para o endereço do seu bucket MinIO onde as imagens são públicas
const MINIO_BASE_URL = 'http://localhost:9000/claricejoias'; // Exemplo: ajuste para o seu bucket

export function GerenciarBanners() {
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');
  
  const [banners, setBanners] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '',
    linkAcao: '',
    ordem: 1,
    ativo: true
  });

  useEffect(() => {
    carregarBanners();
  }, []);

  const carregarBanners = async () => {
    try {
      const data = await BannerService.listarTodos();
      const bannersOrdenados = data.sort((a, b) => a.ordem - b.ordem);
      setBanners(bannersOrdenados);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagem) {
      alert("Por favor, selecione uma imagem para o banner.");
      return;
    }

    setLoading(true);
    setSucesso('');

    try {
      const dadosUpload = await ArquivoService.upload(imagem);
      const objectName = dadosUpload.objectName; 

      const bannerData = {
        titulo: formData.titulo,
        linkAcao: formData.linkAcao,
        ordem: parseInt(formData.ordem),
        ativo: formData.ativo,
        objectName: objectName 
      };

      await BannerService.criarBanner(bannerData);

      setSucesso('Banner cadastrado com sucesso!');
      
      setImagem(null);
      setPreview(null);
      setFormData({ titulo: '', linkAcao: '', ordem: 1, ativo: true });

      carregarBanners();

    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert("Erro ao salvar o banner. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await BannerService.alternarStatus(id);
      carregarBanners(); 
    } catch (error) {
      alert("Erro ao alterar o status do banner.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este banner? Essa ação não pode ser desfeita.")) {
      try {
        await BannerService.deletar(id);
        carregarBanners(); 
      } catch (error) {
        alert("Erro ao excluir o banner.");
      }
    }
  };

  return (
    <div className="gerenciarimg-container">
      <div className="gerenciarimg-header">
        <h2>Gerenciar Banners</h2>
        <p>Adicione novos banners para a página inicial da loja.</p>
      </div>

      <div className="gerenciarimg-card" style={{ marginBottom: '2rem' }}>
        <h3>Novo Banner</h3>
        {sucesso && (
          <div className="gerenciarimg-alert-success">
            <FiCheckCircle size={20} /> {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="gerenciarimg-form">
          
          <div className="gerenciarimg-upload-section">
            <label className="gerenciarimg-upload-label">
              {preview ? (
                <div className="gerenciarimg-image-preview">
                  <img src={preview} alt="Preview do Banner" />
                  <div className="gerenciarimg-upload-overlay">Trocar Imagem</div>
                </div>
              ) : (
                <div className="gerenciarimg-upload-placeholder">
                  <FiUploadCloud size={40} />
                  <span>Clique para selecionar a imagem do banner</span>
                  <small>Recomendado: 1920x600px (JPG ou PNG)</small>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <div className="gerenciarimg-form-grid">
            <div className="gerenciarimg-form-group">
              <label>Título da Campanha (Uso Interno)</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ex: Dia das Mães 2026"
                required
              />
            </div>

            <div className="gerenciarimg-form-group">
              <label>Link de Ação (Para onde o cliente vai ao clicar?)</label>
              <input
                type="text"
                name="linkAcao"
                value={formData.linkAcao}
                onChange={handleChange}
                placeholder="Ex: /categoria/aneis ou vazio"
              />
            </div>

            <div className="gerenciarimg-form-group-row">
              <div className="gerenciarimg-form-group" style={{ flex: 1 }}>
                <label>Ordem de Exibição</label>
                <input
                  type="number"
                  name="ordem"
                  min="1"
                  value={formData.ordem}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gerenciarimg-form-group gerenciarimg-switch-group">
                <label>Status do Banner</label>
                <label className="gerenciarimg-switch">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                  />
                  <span className="gerenciarimg-slider gerenciarimg-round"></span>
                </label>
                <span className="gerenciarimg-status-text">{formData.ativo ? 'Ativo na Loja' : 'Oculto'}</span>
              </div>
            </div>
          </div>

          <div className="gerenciarimg-form-footer">
            <button type="submit" className="gerenciarimg-btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Banner'}
            </button>
          </div>
        </form>
      </div>

      <div className="gerenciarimg-card">
        <h3>Banners Cadastrados</h3>
        
        {banners.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            Nenhum banner cadastrado ainda.
          </p>
        ) : (
          <div className="banners-list">
            <table className="banners-table">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Título</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className={!banner.ativo ? 'banner-inativo' : ''}>
                    <td>
                      <img 
                        src={`${MINIO_BASE_URL}/${banner.objectName}`} 
                        alt={banner.titulo} 
                        className="banner-thumbnail"
                      />
                    </td>
                    <td>
                      <strong>{banner.titulo}</strong>
                      <br/>
                      <small>{banner.linkAcao || 'Sem link'}</small>
                    </td>
                    <td>{banner.ordem}</td>
                    <td>
                      <span className={`status-badge ${banner.ativo ? 'ativo' : 'inativo'}`}>
                        {banner.ativo ? 'Ativo' : 'Oculto'}
                      </span>
                    </td>
                    <td className="banner-actions">
                      <div>
                      <button 
                        onClick={() => handleToggleStatus(banner.id)} 
                        title={banner.ativo ? "Ocultar Banner" : "Ativar Banner"}
                        className="btn-action btn-toggle"
                      >
                        {banner.ativo ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)} 
                        title="Excluir"
                        className="btn-action btn-delete"
                      >
                        <FiTrash2 />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}