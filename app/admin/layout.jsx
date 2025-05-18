// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
         <div className="admin-container">{children}</div>
      </body>
    </html>
  );
}
