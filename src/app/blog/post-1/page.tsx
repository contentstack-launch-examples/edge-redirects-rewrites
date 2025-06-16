export default function BlogPost1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog Post 1 - Redirected Successfully!
            </h1>
            <div className="text-gray-600 text-sm">
              Published on {new Date().toLocaleDateString()}
            </div>
          </header>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              🎉 This page was reached via an edge redirect from <code>/old-blog/post-1</code> to <code>/blog/post-1</code>.
            </p>
            
            <p className="text-gray-700 mb-4">
              The Contentstack Launch Edge Function successfully processed the redirect rule and brought you here.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Edge Redirect Working!</strong> The URL <code>/old-blog/post-1</code> was successfully redirected to this page.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How the redirect works:
            </h2>
            
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Request made to <code>/old-blog/post-1</code></li>
              <li>Edge function checks redirect rules</li>
              <li>Finds matching rule for this path</li>
              <li>Returns 301 redirect to <code>/blog/post-1</code></li>
              <li>Browser/client follows redirect to this page</li>
            </ol>
          </div>
        </article>
      </div>
    </div>
  );
}
