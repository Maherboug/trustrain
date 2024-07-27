import React, { useState } from 'react';
import { Form, InputNumber, Input, Button, Card, message } from 'antd';
import { AptosClient, AptosAccount } from 'aptos';
import './Marketplace.css';
const client = new AptosClient('https://fullnode.devnet.aptoslabs.com');


interface Resource {
  id: number;
  type: string;
  size?: string;
  ram?: string;
  cache?: string;
  availableTime?: string;
  category?: string;
}

interface User {
  id: number;
  name: string;
  resources: Resource[];
}

const users: User[] = [
  {
    id: 1,
    name: 'User 1',
    resources: [
      {
        id: 1,
        type: 'Collab',
        ram: '16 GB',
        cache: '8 GB',
        availableTime: '140 hours/week',
      },
      {
        id: 2,
        type: 'Dataset',
        size: '500 GB',
        category: 'Images',
      },
    ],
  },
  {
    id: 2,
    name: 'User 2',
    resources: [
      {
        id: 1,
        type: 'Dataset',
        size: '1 TB',
        category: 'eHealth (Stroke)',
      },
    ],
  },
  // Add more users as needed
];
const AllocateResource: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const account = new AptosAccount(); // Use the wallet integration to get the actual account

      const payload = {
        type: 'entry_function_payload',
        function: '0x1::ModuleName::allocate_resource', // Replace with actual function
        arguments: [values.cpu, values.gpu, account.address().hex(), values.providerAddress, values.modelId, values.allocationTime],
        type_arguments: []
      };

      const txnRequest = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transaction = await client.submitTransaction(signedTxn);

      await client.waitForTransaction(transaction.hash);
      message.success('Resource allocated successfully');
    } catch (error) {
      message.error('Failed to allocate resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketplace">
      <h1>Marketplace - Shared Resources</h1>
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              <h2>{user.name}</h2>
            </div>
            {user.resources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <h3>Resource {resource.id}</h3>
                <p>Type: {resource.type}</p>
                {resource.ram && <p>RAM: {resource.ram}</p>}
                {resource.cache && <p>Cache: {resource.cache}</p>}
                {resource.availableTime && <p>Available Time: {resource.availableTime}</p>}
                {resource.size && <p>Size: {resource.size}</p>}
                {resource.category && <p>Category: {resource.category}</p>}
                <button>Allocate</button>
                <button>Transfer Tokens</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocateResource;
