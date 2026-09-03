import Layout from "@/components/layout/Layout";

const PageLoader = () => (
  <Layout>
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  </Layout>
);

export default PageLoader;
