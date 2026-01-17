import React from 'react';

const RecentTransactions = ({ transactions = [] }) => {
 

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
        {/* You can link this button to the full transactions page later */}
        <button className="text-purple-600 text-sm font-semibold hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-100">
              <th className="py-3 font-medium">Customer / Description</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">No transactions yet.</td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition">
                  <td className="py-4 font-medium">{txn.description || txn.name}</td>
                  {/* We assume date is a Firestore timestamp or string, converting to simpler format here */}
                  <td className="py-4 text-gray-500">
                    {txn.date?.seconds ? new Date(txn.date.seconds * 1000).toLocaleDateString() : txn.date}
                  </td>
                  <td className={`py-4 font-bold ${txn.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.type === 'income' ? '+' : '-'}₦{parseInt(txn.amount).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                      ${txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;