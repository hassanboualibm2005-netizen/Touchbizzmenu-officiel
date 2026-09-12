import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Printer,
  Smartphone,
} from 'lucide-react';
import { Restaurant } from '../../types/database';

interface QRCodeManagerProps {
  restaurant: Restaurant;
  onPreview: () => void;
}

export const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  restaurant,
  onPreview,
}) => {
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [domainOverride, setDomainOverride] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  // Compute public target URL
  // Default to current window origin if available, or menu.touchbizz.ma
  const defaultHost =
    typeof window !== 'undefined' && window.location.origin.includes('http')
      ? window.location.origin
      : 'https://menu.touchbizz.ma';

  const hostToUse = domainOverride.trim() || defaultHost;
  const targetUrl = `${hostToUse.replace(/\/$/, '')}/r/${restaurant.slug}`;

  // Generate QR Code PNG
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrPngUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [targetUrl]);

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const a = document.createElement('a');
    a.href = qrPngUrl;
    a.download = `qrcode-${restaurant.slug}.png`;
    a.click();
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${restaurant.slug}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating SVG QR code:', err);
    }
  };

  // Print counter display
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            QR Code & Supports Clients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ce QR code pointe exclusivement vers votre menu public. Il reste permanent même si vous modifiez vos plats ou tarifs.
          </p>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 self-start shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span>Ouvrir l'URL du menu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: QR Generator & Downloads */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="text-center">
              {/* QR Code Container */}
              <div className="inline-block p-4 rounded-3xl bg-white border-2 border-slate-100 shadow-lg mb-4">
                {qrPngUrl ? (
                  <img
                    src={qrPngUrl}
                    alt={`QR Code ${restaurant.name}`}
                    className="w-56 h-56 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                    Génération du QR code...
                  </div>
                )}
              </div>

              {/* Verified Public Target URL */}
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-left mb-6">
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    URL Publique Fixe
                  </span>
                  <span className="text-xs font-mono font-semibold text-blue-600 truncate block">
                    {targetUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger PNG (Haute Définition)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Format Vectoriel SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Domain customization note */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Domaine personnalisé (ex: menu.touchbizz.ma)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Par défaut, le QR code utilise l'adresse de votre application. Vous pouvez indiquer un domaine personnalisé pour vos impressions :
            </p>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-600">
              <input
                type="text"
                value={domainOverride}
                onChange={(e) => setDomainOverride(e.target.value)}
                placeholder="https://menu.touchbizz.ma"
                className="w-full px-3 py-2 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right column: Printable Stand Mockup Preview */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                Chevalet de table & Présentoir à imprimer
              </h3>
              <button
                type="button"
                onClick={handlePrint}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Imprimer le présentoir
              </button>
            </div>

            {/* Printable Frame */}
            <div
              ref={printRef}
              className="max-w-xs mx-auto bg-gradient-to-b from-stone-50 to-white border-2 border-stone-200 rounded-3xl p-6 text-center shadow-md relative overflow-hidden"
            >
              {/* Header decorative bar */}
              <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full mb-4" />

              {/* Logo */}
              {restaurant.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-14 h-14 mx-auto rounded-xl object-cover mb-2 border border-stone-200 shadow-xs"
                />
              )}

              <h4 className="text-base font-extrabold text-stone-900 leading-tight">
                {restaurant.name}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 mb-4">
                Scannez pour découvrir notre carte digitale
              </p>

              {/* QR Code in stand */}
              <div className="p-3 bg-white rounded-2xl border border-stone-200 inline-block shadow-inner mb-4">
                {qrPngUrl && (
                  <img
                    src={qrPngUrl}
                    alt="QR Stand"
                    className="w-36 h-36 mx-auto object-contain"
                  />
                )}
              </div>

              {/* Phone instruction badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-700 bg-stone-100 py-1.5 px-3 rounded-full">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Ouvrez l'appareil photo de votre smartphone</span>
              </div>

              <div className="mt-4 text-[9px] text-stone-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>TouchBizz Menu Digital • Sans contact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
