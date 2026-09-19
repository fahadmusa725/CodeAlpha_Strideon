import { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order & Shipping',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    setErrorMsg('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    try {
      if (serviceId && templateId && publicKey && serviceId !== 'your_emailjs_service_id_here') {
        await emailjs.send(
          serviceId,
          templateId,
          {
            name: formData.name,
            email: formData.email,
            inquiry_type: formData.subject,
            message: formData.message,
          },
          publicKey
        );
      } else {
        // Fallback simulation if placeholder keys are set
        await new Promise((r) => setTimeout(r, 600));
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Order & Shipping', message: '' });
    } catch (err) {
      console.error('EmailJS transmission error:', err);
      setErrorMsg(err.text || 'Failed to transmit message. Please try again or reach out directly to support@strideon.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container">
      <div className="contact-header">
        <span className="badge badge-orange">Support & Inquiries</span>
        <h1 className="text-headline">GET IN TOUCH WITH THE SQUAD</h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', maxWidth: '600px' }}>
          Have a question about a drop, order status, sizing advice, or press partnerships? 
          Drop us a line and our crew will get back to you within 24 hours.
        </p>
      </div>

      <div className="contact-layout">
        {/* Contact Info Sidebar */}
        <aside className="contact-info-panel">
          <div className="contact-info-block">
            <h3 className="contact-info-title">Headquarters</h3>
            <p className="contact-info-text">
              STRIDEON Flagship & HQ<br />
              442 Broadway, Soho<br />
              New York, NY 10013, USA
            </p>
          </div>

          <div className="contact-info-block">
            <h3 className="contact-info-title">Direct Channels</h3>
            <p className="contact-info-text">
              <strong>Support:</strong> support@strideon.com<br />
              <strong>Press & Drops:</strong> press@strideon.com<br />
              <strong>Direct Line:</strong> +1 (800) 555-STRIDE
            </p>
          </div>

          <div className="contact-info-block">
            <h3 className="contact-info-title">Operating Hours</h3>
            <p className="contact-info-text">
              Monday – Friday: 9:00 AM – 7:00 PM EST<br />
              Saturday – Sunday: 10:00 AM – 5:00 PM EST
            </p>
          </div>

          <div className="contact-faq-preview">
            <h4>Quick Assistance</h4>
            <p className="text-xs text-muted">
              Looking for order tracking or returns? Check your order history in your account dashboard.
            </p>
          </div>
        </aside>

        {/* Contact Form */}
        <main className="contact-form-card">
          {submitted ? (
            <div className="contact-success-state">
              <span className="contact-success-icon">⚡</span>
              <h2 className="text-headline">MESSAGE RECEIVED</h2>
              <p className="text-muted" style={{ maxWidth: '440px', margin: '0 auto' }}>
                Thanks for reaching out. Our dispatch team has received your message and will respond to your email shortly.
              </p>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" id="contact-form">
              <h3 className="form-heading">Send a Transmission</h3>

              {errorMsg && (
                <div className="auth-alert" style={{ marginBottom: '1rem' }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="e.g. alex@domain.com"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">
                  Inquiry Topic
                </label>
                <select
                  id="contact-subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Order & Shipping">Order Tracking & Shipping</option>
                  <option value="Sizing & Fit Advice">Sizing & Fit Advice</option>
                  <option value="Product Authenticity">Product Authenticity / Verification</option>
                  <option value="Returns & Exchanges">Returns & Exchanges</option>
                  <option value="Collabs & Press">Brand Collaborations & Press</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                id="contact-submit-btn"
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? <span className="spinner" /> : 'Transmit Message →'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
