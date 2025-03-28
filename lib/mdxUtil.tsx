export const components = {
  h1: (props: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mb-3" {...props} />,
  p: (props: any) => <p className="mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  code: (props: any) => <code className="bg-gray-100 rounded p-1" {...props} />,
  pre: (props: any) => (
    <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4" {...props} />
  ),
};
