export const getStatusUpdateEmailHtml = (
  seekerName: string,
  jobTitle: string,
  companyName: string,
  status: string
) => {
  const statusColors: Record<string, string> = {
    SHORTLISTED: "#10b981", // Success Green
    REJECTED: "#ef4444",    // Error Red
    INTERVIEWING: "#3b82f6", // Info Blue
    OFFER: "#8b5cf6",       // Purple
    APPLIED: "#000000",     // Black
  };

  const statusColor = statusColors[status] || "#000000";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #000000; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 4px solid #000000; padding: 40px; box-shadow: 12px 12px 0px #000000; }
        .header { border-bottom: 4px solid #000000; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; }
        .status-badge { display: inline-block; padding: 8px 16px; background-color: ${statusColor}; color: #ffffff; font-weight: 900; text-transform: uppercase; border: 2px solid #000000; margin-bottom: 20px; }
        .content { font-size: 18px; margin-bottom: 30px; }
        .footer { border-top: 4px solid #000000; padding-top: 20px; font-size: 14px; font-weight: bold; }
        .button { display: inline-block; padding: 16px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-weight: 900; text-transform: uppercase; border: 2px solid #000000; transition: transform 0.1s; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">RecruitFlow</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${seekerName}</strong>,</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
          <div class="status-badge">${status}</div>
          <p>Log in to your dashboard to see the latest updates and take next steps.</p>
          <a href="${process.env.NEXTAUTH_URL}/seeker/applications" class="button">View Application</a>
        </div>
        <div class="footer">
          &copy; 2026 RecruitFlow. Brutally Simple Hiring.
        </div>
      </div>
    </body>
    </html>
  `;
};
