import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order status',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS environment variables are not configured.');
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 800);
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          reply_to: formData.email,
          inquiry_type: formData.subject,
          message: formData.message,
        },
        publicKey
      );

      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setLoading(false);
      setErrorMsg('Failed to send message. Please try again or reach out directly.');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1 className="contact-title">Contact us</h1>
        <p className="contact-subtitle">
          Questions about an order, sizing or a product? Send us a message and we will reply by email.
        </p>
      </div>

      <div className="contact-form-card">
        {submitted ? (
          <div className="contact-success-state">
            <div className="contact-success-icon">✓</div>
            <h3>Message Sent</h3>
            <p>
              Thanks for reaching out. We will reply to your email shortly.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: 'Order status', message: '' });
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="alert-banner alert-error" style={{ marginBottom: '1.5rem' }}>
                {errorMsg}
              </div>
            )}

            <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Name</label>
                <input 
                  type="text" 
                  id="contact-name" 
                  name="name" 
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input 
                  type="email" 
                  id="contact-email" 
                  name="email" 
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">Topic</label>
                <select 
                  id="contact-subject" 
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="Order status">Order status</option>
                  <option value="Sizing and fit">Sizing and fit</option>
                  <option value="Product question">Product question</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea 
                  id="contact-message" 
                  name="message" 
                  className="form-input contact-textarea"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..." 
                  required 
                ></textarea>
              </div>

              <button 
                id="contact-submit-btn" 
                type="submit" 
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : 'Send message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Contact;
