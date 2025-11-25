export const validateBasicInput = (type: 'text' | 'url', content: string): { isValid: boolean; error?: string } => {
  if (!content || !content.trim()) {
    return { isValid: false, error: type === 'url' ? 'Please enter a URL to analyze' : 'Please enter text to analyze' };
  }

  if (type === 'url') {
    // Only validate URL format, no threat detection (Generative LLM will do that)
    try {
      const urlObj = new URL(content);
      // Check for valid protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must start with http:// or https://' };
      }
      // Basic length check
      if (content.length > 2000) {
        return { isValid: false, error: 'URL is too long (maximum 2000 characters)' };
      }
    } catch (e) {
      return { isValid: false, error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' };
    }
  } else {
    // Basic length checks for text
    if (content.trim().length < 3) {
      return { isValid: false, error: 'Text is too short. Please enter at least 3 characters.' };
    }
    if (content.length > 10000) {
      return { isValid: false, error: 'Text is too long. Maximum 10,000 characters allowed.' };
    }
  }

  return { isValid: true };
};

