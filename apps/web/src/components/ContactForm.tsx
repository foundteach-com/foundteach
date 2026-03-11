"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://api.foundteach.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error en el servidor");
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="form-success">
        <div className="form-success-icon">✅</div>
        <h3>¡Mensaje enviado!</h3>
        <p>Nuestro equipo te responderá en menos de 48 horas.</p>
        <button
          onClick={() => setStatus("idle")}
          className="btn btn-premium-cta"
          style={{ marginTop: "1.5rem" }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-name">Nombre completo *</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">Correo electrónico *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-phone">Teléfono / WhatsApp</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="+57 300 000 0000"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-subject">Asunto *</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            placeholder="Cotización, consulta, soporte..."
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="contact-message">Cuéntanos más *</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Describe tu proyecto o idea con el mayor detalle posible..."
          value={formData.message}
          onChange={handleChange}
        />
      </div>
      {status === "error" && (
        <p className="form-error">
          ❌ Ocurrió un error. Por favor intenta de nuevo o escríbenos directamente.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-premium-cta"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {status === "loading" ? "Enviando..." : "ENVIAR MENSAJE"}
      </button>
    </form>
  );
}
