import React from 'react';

const VisaGuide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
         <h1 className="text-3xl font-bold text-gray-900">Visa Types Explained</h1>
         <p className="text-gray-500 mt-2">Understand the terminology before you fly.</p>
      </div>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-emerald-600 mb-3">Visa Free</h2>
        <p className="text-gray-600 leading-relaxed">
          You can enter the country using just your passport. No prior application is needed. 
          Usually, you just get a stamp at the border control. Ensure your passport is valid for at least 6 months beyond your stay.
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-blue-600 mb-3">Visa on Arrival (VoA)</h2>
        <p className="text-gray-600 leading-relaxed">
          You need a visa, but you can apply for it and pay when you arrive at the airport or border crossing.
          <br/><br/>
          <strong>Tip:</strong> Carry exact cash (USD/EUR) and passport-sized photos just in case.
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-amber-600 mb-3">Electronic Visa (e-Visa / ETA)</h2>
        <p className="text-gray-600 leading-relaxed">
          A digital visa that must be applied for online <strong>before</strong> your trip.
          Approval is usually sent via email. You must print it out or show it on your phone.
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-rose-600 mb-3">Visa Required</h2>
        <p className="text-gray-600 leading-relaxed">
          The most strict category. You must visit an embassy or consulate in your home country to apply for a visa sticker in your passport.
          This process can take weeks, so plan ahead.
        </p>
      </section>
    </div>
  );
};

export default VisaGuide;
