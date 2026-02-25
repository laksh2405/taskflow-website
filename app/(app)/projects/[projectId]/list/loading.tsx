export default function Loading() {
  return (
    <div className="p-6">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
              <th className="h-12 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-4">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
