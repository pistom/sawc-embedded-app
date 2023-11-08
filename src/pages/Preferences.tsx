import { writeStorage } from "@rehooks/local-storage";
import { useEffect, useState } from "react";
import { useFetch } from "use-http";

interface PreferencesProps {
  setTitle: (title: string) => void;
  config: Config | null;
}

export default function Preferences({ config, setTitle }: PreferencesProps) {
  const [token, setToken] = useState<string>('');
  const { post, response } = useFetch()

  useEffect(() => {
    setTitle('Preferences');
  }, [setTitle]);

  const handleChangeToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(() => event.target.value);
  }

  const handleSaveToken = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    writeStorage('token', token);
    window.location.href = '/';
  }

  const handleSetNewToken = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
      const data = await post('/token', {token});
      if (response.ok) {
        writeStorage('token', data.token);
        alert('Password changed');
      }
  }

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    writeStorage('token', '');
    window.location.href = '/preferences';
  }

  return (
    <form className="form">
      {config && <div className="text-right"><button className="btn btn-ternary" onClick={handleLogout}>Logout</button></div>}
      {!config ?
        <label htmlFor="token">Password</label> :
        <label htmlFor="token">Set new password</label>
      }
      <input type="password" name="token" value={token} onChange={handleChangeToken} />
      {!config ?
        <button className="btn btn-primary ml-2" onClick={handleSaveToken}>Connect</button> : <>
        <button className="btn btn-primary ml-2" onClick={handleSetNewToken}>Change password</button>
        </>
      }
    </form>
  );
}