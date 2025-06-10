export default function AuthLayout({childern}: {childern: React.ReactNode}) {
  return (
    <div className="flex items-center justify-center h-full">{childern}</div>
  );
}
