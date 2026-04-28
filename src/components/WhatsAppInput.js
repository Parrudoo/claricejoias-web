import React from 'react';

const WhatsAppInput = ({ 
    value, 
    onChange, 
    label = "Seu melhor WhatsApp", 
    placeholder = "(00) 00000-0000", 
    required = false,
    className = "" 
}) => {

    const aplicarMascaraWhatsapp = (val) => {
        if (!val) return "";
        return val
            .replace(/\D/g, "") // Remove tudo que não é número
            .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
            .replace(/(\d{5})(\d)/, "$1-$2") // Coloca o hífen no número
            .replace(/(-\d{4})\d+?$/, "$1"); // Limpa números extras (max 15 chars)
    };

    const handleChange = (e) => {
        const valorMascarado = aplicarMascaraWhatsapp(e.target.value);
        // Devolvemos apenas o valor em texto puro para o componente pai
        // Isso deixa o código de quem usa o componente muito mais limpo!
        onChange(valorMascarado);
    };

    return (
        <div className={`input-group ${className}`}>
            <label>{label}</label>
            <input
                type="tel"
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={handleChange}
                maxLength="15" /* Trava nativa do HTML para 15 caracteres: (XX) XXXXX-XXXX */
            />
        </div>
    );
};

export default WhatsAppInput;