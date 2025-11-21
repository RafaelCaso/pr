import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { useCreateGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useDevice } from '../providers/deviceProvider';

interface CreateGroupPageProps {
  onBack: () => void;
  onSuccess: (groupId: string) => void;
}

export const CreateGroupPage = ({ onBack, onSuccess }: CreateGroupPageProps) => {
  const { session } = useStytchSession();
  const createMutation = useCreateGroup();
  const { isMobile } = useDevice();
  
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
    <div className="page-wrapper">
      <div className="container-form">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">Create Prayer Group</h1>
          <p className="page-description">
            Create a new prayer group. You can make it public or private with a code.
          </p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="groupName" className="form-label form-label-required">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
              <p className="form-help-text">
                Group names must be unique
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="groupDescription" className="form-label form-label-required">
                Description
              </label>
              <textarea
                id="groupDescription"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your prayer group..."
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>Make this group public (anyone can join without a code)</span>
              </label>
              {!isPublic && (
                <p className="form-help-text" style={{ paddingLeft: '28px' }}>
                  Private groups require a code to join. A code will be generated when you create the group.
                </p>
              )}
            </div>
            
            <div className="action-group">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !description.trim()}
                className="btn btn-success"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

