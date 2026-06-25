import { Copy, MessageCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { buildWhatsAppUrl, formatCurrency } from "@/utils/format";

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderData,
  whatsappNumber,
  waMessage,
}) {
  if (!orderData) return null;

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} disalin`);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Pesanan" size="lg">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Pesanan berhasil dicatat!</p>
            <p className="mt-1 text-sm text-green-800">
              Pesanan sudah masuk ke sistem. Silakan konfirmasi ke penjual via WhatsApp
              dengan pesan di bawah ini.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
          <p><strong>Kode Pesanan:</strong> {orderData.order_code}</p>
          <p><strong>Total Bayar:</strong> {formatCurrency(orderData.total_price)}</p>
          <p>
            <strong>Metode:</strong>{" "}
            {orderData.delivery_type === "delivery" ? "Pengantaran" : "Pick-Up Store"}
          </p>
        </div>

        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
          <p className="text-sm font-medium text-primary-900">WhatsApp Penjual</p>
          <p className="mt-2 text-xl font-bold tracking-wide text-primary-800">{whatsappNumber}</p>
          <button
            type="button"
            onClick={() => copyText(whatsappNumber, "Nomor WhatsApp")}
            className="btn-secondary mt-3 text-sm"
          >
            <Copy className="h-4 w-4" />
            Salin Nomor WA
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-1 text-sm font-medium text-gray-700">Pesan Konfirmasi ke Penjual</p>
          <p className="mb-2 text-xs text-gray-500">
            Salin pesan ini atau buka WhatsApp, lalu kirim manual ke penjual.
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">{waMessage}</pre>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => copyText(waMessage, "Pesan WhatsApp")}
              className="btn-secondary flex-1 text-sm"
            >
              <Copy className="h-4 w-4" />
              Salin Pesan
            </button>
            <a
              href={buildWhatsAppUrl(whatsappNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp flex-1 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Buka WhatsApp Penjual
            </a>
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn-primary w-full">
          Selesai
        </button>
      </div>
    </Modal>
  );
}
