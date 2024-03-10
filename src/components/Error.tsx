export default function Error({error}: {error: Error}) {
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <pre className="mt-4">
        {error.message}
      </pre>
      <p className="mt-4">
        <a className="btn btn-primary" href='/'>Home page</a>
      </p>
    </div>
  );
}