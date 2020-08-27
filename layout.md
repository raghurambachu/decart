<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <link rel="stylesheet" href="/stylesheets/style.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap-grid.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css"
    />
  </head>
  <body>
    <div class="sidebar">
      <ul class="sidebar-list">
        <li class="sd-list-item">
          <a class="sd-link-item" href="/">
            <span class="fa-gap"><i class="fas fa-tachometer-alt"></i></span>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="sd-list-item">
          <a class="sd-link-item" href="/">
            <span class="fa-gap"><i class="fas fa-user-circle"></i></span>
            <span>Approve Vendors</span>
          </a>
        </li>
        <li class="sd-list-item">
          <a class="sd-link-item" href="/admins/block/users">
            <span class="fa-gap"><i class="fas fa-plus"></i></span>
            <span>Block Users</span>
          </a>
        </li>
        <li class="sd-list-item">
          <a class="sd-link-item" href="/admins/block/vendors">
            <span class="fa-gap"><i class="fas fa-newspaper"></i></span>
            <span>Block Vendors</span>
          </a>
        </li>
        <li class="sd-list-item">
          <a class="sd-link-item" href="/admins/delist">
            <span class="fa-gap"><i class="fas fa-edit"></i></span>
            <span>Delist Products</span>
          </a>
        </li>
        <li class="sd-list-item">
          <a class="sd-link-item" href="/admins/banner">
            <span class="fa-gap"><i class="fas fa-trash"></i></span>
            <span>Add Banner</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="dashboard-container">
      <main class="main">
        <div class="display-details">
          <p class="flex logout">
            <span>
              Howdy, <%= admin.username %>
            </span>
            <a class="btn-logout" href="/users/logout">
              <i class="fas fa-sign-out-alt"></i>
            </a>
          </p>
        </div>
        <div class="admin-dashboard"></div>
      </main>
    </div>
  </body>
</html>