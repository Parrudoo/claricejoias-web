import React, { useState } from 'react';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';

// Certifique-se de que o nome do arquivo CSS aqui está correto (GerenciarBanners.css ou GerenciarImagens.css)
import './GerenciarBanners.css';
import { ArquivoService } from '../../../services/ArquivoService';
import { BannerService } from '../../../services/BannerService';

export function GerenciarBanners() {
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    linkAcao: '',
    ordem: 1,
    ativo: true
  });

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

    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert("Erro ao salvar o banner. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gerenciarimg-container">
      <div className="gerenciarimg-header">
        <h2>Gerenciar Banners</h2>
        <p>Adicione novos banners para a página inicial da loja.</p>
      </div>

      <div className="gerenciarimg-card">
        {sucesso && (
          <div className="gerenciarimg-alert-success">
            <FiCheckCircle size={20} /> {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="gerenciarimg-form">
          
          {/* ÁREA DE UPLOAD DE IMAGEM */}
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

          {/* CAMPOS DE CONFIGURAÇÃO */}
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
    </div>
  );
}