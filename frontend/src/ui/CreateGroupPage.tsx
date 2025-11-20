import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { useCreateGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface CreateGroupPageProps {
  onBack: () => void;
  onSuccess: (groupId: string) => void;
}

export const CreateGroupPage = ({ onBack, onSuccess }: CreateGroupPageProps) => {
  const { session } = useStytchSession();
  const createMutation = useCreateGroup();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !name.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const group = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });
      // Reset form and navigate to the new group
      setName('');
      setDescription('');
      setIsPublic(false);
      onSuccess(group._id);
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>Create Prayer Group</h1>
        <p style={{ color: '#666' }}>
          Create a new prayer group. You can make it public or private with a code.
        </p>
      </div>
      
      <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="groupName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Group Name *
            </label>
            <input
              id="groupName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
              Group names must be unique
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="groupDescription" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your prayer group..."
              required
              style={{
                width: '100%',
                padding: '8px',
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Make this group public (anyone can join without a code)</span>
            </label>
            {!isPublic && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666', paddingLeft: '24px' }}>
                Private groups require a code to join. A code will be generated when you create the group.
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              style={{
                padding: '10px 20px',
                cursor: isSubmitting || !name.trim() || !description.trim() ? 'not-allowed' : 'pointer',
                backgroundColor: isSubmitting || !name.trim() || !description.trim() ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

