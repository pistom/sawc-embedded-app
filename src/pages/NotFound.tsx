export default function NotFound() {
  return (
    <div id="error-page">
      <h1>Oops! 404</h1>
      <p>
        Sorry, the page you are looking for does not exist.
      </p>
      <p className="mt-4">
        <a className="btn btn-primary" href='/'>Home page</a>
      </p>
    </div>
  );
}