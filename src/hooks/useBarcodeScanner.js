import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan) => {
    const barcodeBuffer = useRef('');
    const typingTimeout = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignora teclas modificadoras
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            // Se apertou Enter e temos algo no buffer, dispara a leitura!
            if (event.key === 'Enter') {
                if (barcodeBuffer.current.length > 5) { // Evita "Enters" acidentais soltos
                    onScan(barcodeBuffer.current);
                }
                barcodeBuffer.current = '';
                return;
            }

            // Ignora teclas de navegação (Setas, Shift, etc)
            if (event.key.length !== 1) return;

            // Adiciona o caractere digitado ao buffer
            barcodeBuffer.current += event.key;

            // Limpa o timeout anterior
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }

            // Leitores de código de barras digitam muito rápido (milissegundos).
            // Se demorar mais de 100ms entre uma tecla e outra, é um humano digitando, então limpamos.
            typingTimeout.current = setTimeout(() => {
                barcodeBuffer.current = '';
            }, 100); 
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [onScan]);
};