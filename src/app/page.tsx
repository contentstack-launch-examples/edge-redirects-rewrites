export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Edge Redirects & Rewrites Demo
        </h1>
        
        <div className="flex justify-center mb-6">
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="Icon--original" 
            name="LaunchGreen" 
            data-test-id="cs-icon"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M122.5 61.53v51.09h-45V61.53q0 -1.4 0.12 -2.78h44.76q0.12 1.38 0.12 2.78m-1.67 -10.28a32.5 32.5 0 0 0 -12.8 -16.767L100 29.137l-8.03 5.35a32.5 32.5 0 0 0 -12.8 16.767zM70 61.53a40 40 0 0 1 17.81 -33.287l9.417 -6.273a5 5 0 0 1 5.55 0l9.417 6.273A40 40 0 0 1 130 61.53v20.85a5 5 0 0 1 1.853 0.363l15 6A5 5 0 0 1 150 93.383v29.23a5 5 0 0 1 -6.853 4.64l-17.847 -7.137h-3.25l5.203 13.023A5 5 0 0 1 122.617 140H77.387a5 5 0 0 1 -4.64 -6.853l5.203 -13.023h-3.25l-17.847 7.137A5 5 0 0 1 50 122.617v-29.23a5 5 0 0 1 3.147 -4.64l15 -6a5 5 0 0 1 1.853 -0.363zm30 31.09a7.5 7.5 0 1 0 0 -15 7.5 7.5 0 0 0 0 15m0 7.5a15 15 0 1 0 0 -30 15 15 0 0 0 0 30m-20 46.25a3.75 3.75 0 0 1 3.75 3.75v15a3.75 3.75 0 0 1 -7.5 0v-15A3.75 3.75 0 0 1 80 146.37m23.75 13.75a3.75 3.75 0 0 0 -7.5 0v15a3.75 3.75 0 0 0 7.5 0zM120 146.37a3.75 3.75 0 0 1 3.75 3.75v15a3.75 3.75 0 0 1 -7.5 0v-15A3.75 3.75 0 0 1 120 146.37m-62.5 -27.45v-23.84l10 -4v23.84zm85 -23.84v23.847l-10 -4v-23.85l10 4zM81.073 132.5l4 -10h29.85l4 10z" 
              fill="#38A86B"
            />
          </svg>
        </div>
        
        <p className="text-lg text-gray-600">
          Powered by Contentstack Launch
        </p>
      </div>
    </div>
  );
}
