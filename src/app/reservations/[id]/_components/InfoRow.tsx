function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-t1 font-medium text-gray500">{label}</span>
      {children}
    </div>
  );
}

export default InfoRow;
