var expect = chai.expect;

Backbone.history.start();

afterEach(function () {
  document.getElementById("fixture").innerHTML = "";
});

describe("extra attributes", function () {
  it("should set data-view-cid", function () {
    var view = new Handlebones.View();
    expect(view.el.getAttribute("data-view-cid")).to.match(/^view[\d]+$/);
  });

  it("should not error with no name attr", function () {
    var view = new Handlebones.View();
    expect(view.el.getAttribute("data-view-name")).to.be.null;
  });

  it("should set data-view-name attribute", function () {
    var view = new (Handlebones.View.extend({
      name: "test"
    }));
    expect(view.el.getAttribute("data-view-name")).to.equal("test");
  });

  it("setElement will re-add data-view-name and data-view-cid", function () {
    var view = new (Handlebones.View.extend({
      name: "test"
    }));
    view.setElement(document.createElement("DIV"));
    expect(view.el.getAttribute("data-view-name")).to.equal("test");
    expect(view.el.getAttribute("data-view-cid")).to.match(/^view[\d]+$/);
  });

  it("setElement will add data-view-name and data-view-cid to existing element", function () {
    var view = new (Handlebones.View.extend({
      name: "test",
      element: document.getElementById("fixture")
    }));
    expect(view.el.getAttribute("data-view-name")).to.equal("test");
    expect(view.el.getAttribute("data-view-cid")).to.match(/^view[\d]+$/);
  });

  it("data-view-name and data-view-cid removed on view.remove()", function () {
    var view = new (Handlebones.View.extend({
      name: "test",
      element: document.getElementById("fixture")
    }));
    view.remove();
    expect(view.el.getAttribute("data-view-name")).to.be.null;
    expect(view.el.getAttribute("data-view-cid")).to.be.null;
  });
});

describe("template, render & context", function () {
  it("should not error with no template", function () {
    var view = new Handlebones.View();
    view.render();
    expect(view.el.innerHTML).to.equal("");
  });

  it("should render a template", function () {
    var view = new (Handlebones.View.extend({
      template: Handlebars.compile("test")
    }));
    view.render();
    expect(view.el.innerHTML).to.equal("test");
  });

  it("render should accept a string or template argument", function () {
    var view = new (Handlebones.View.extend({
      context: function () {
        return {
          key: "value"
        };
      }
    }));
    view.render("test");
    expect(view.el.innerHTML).to.equal("test");
    view.render(Handlebars.compile("{{key}}"));
    expect(view.el.innerHTML).to.equal("value");
  });

  it("should trigger render event", function () {
    var spy = sinon.spy();
    var view = new (Handlebones.View.extend({
      initialize: function () {
        this.listenTo(this, "render", spy);
      }
    }));
    view.render();
    expect(spy.callCount).to.equal(1);
  });

  it("should render a template with context", function () {
    var view = new (Handlebones.View.extend({
      template: Handlebars.compile("{{key}}"),
      context: function () {
        return {
          key: "value"
        };
      }
    }));
    view.render();
    expect(view.el.innerHTML).to.equal("value");
  });
});

describe("appendTo & ready", function () {
  it("should render when appended", function () {
    var view = new (Handlebones.View.extend({
      id: "test-view",
      template: Handlebars.compile("test")
    }));
    view.appendTo(document.getElementById("fixture"));
    expect(document.getElementById("test-view").innerHTML).to.equal("test");
  });

  it("should fire ready event when appended", function () {
    var view;
    var spy = sinon.spy(function (options) {
      // should pass target param
      expect(options.target).to.equal(view);
    });
    view = new (Handlebones.View.extend({
      id: "test-view",
      template: Handlebars.compile("test"),
      initialize: function () {
        this.listenTo(this, "ready", spy);
      }
    }));
    view.appendTo(document.getElementById("fixture"));
    expect(spy.callCount).to.equal(1);

    // will fire multiple times
    view.appendTo(document.getElementById("fixture"));
    expect(spy.callCount).to.equal(2);
  });

  it("should allow a custom appendTo insertion operation", function () {
    var view = new (Handlebones.View.extend({
      id: "test-view",
      template: Handlebars.compile("test")
    }));
    view.appendTo(function () {
      document.getElementById("fixture").appendChild(view.el);
    });
    expect(document.getElementById("test-view").innerHTML).to.equal("test");
  });
});

describe("addChild & removeChild", function () {
  it("should set and remove parent attr", function () {
    var parent = new Handlebones.View();
    var child = new Handlebones.View();
    parent.addChild(child);
    expect(child.parent).to.equal(parent);
    parent.removeChild(child);
    expect(child.parent).to.be["undefined"];
  });

  it("should update children array", function () {
    var parent = new Handlebones.View();
    var child = new Handlebones.View();
    parent.addChild(child);
    expect(parent.children[child.cid]).to.equal(child);
    parent.removeChild(child);
    expect(parent.children[child.cid]).to.be["undefined"];
  });

  it("should fire addChild and removeChild events", function () {
    var parent = new Handlebones.View();
    var child = new Handlebones.View();
    var addChildSpy = sinon.spy(function (view) {
      expect(view).to.equal(child);
    });
    var removeChildSpy = sinon.spy(function (view) {
      expect(view).to.equal(child);
    });
    parent.listenTo(parent, "addChild", addChildSpy);
    parent.listenTo(parent, "removeChild", removeChildSpy);
    parent.addChild(child);
    expect(addChildSpy.callCount).to.equal(1);
    parent.removeChild(child);
    expect(removeChildSpy.callCount).to.equal(1);
  });
});

describe("LayoutView", function () {
  it("should append and render a view", function () {
    var layout = new Handlebones.LayoutView();
    var view = new (Handlebones.View.extend({
      id: "test-view",
      template: Handlebars.compile("test")
    }));
    layout.appendTo(document.getElementById("fixture"));
    layout.setView(view);
    expect(layout.getView()).to.equal(view);
    expect(document.getElementById("test-view").innerHTML).to.equal("test");
  });

  it("should allow a callback option", function () {
    var layout = new Handlebones.LayoutView();
    var view = new (Handlebones.View.extend({
      id: "test-view",
      template: Handlebars.compile("test")
    }));
    layout.appendTo(document.getElementById("fixture"));
    layout.setView(view, function (view, oldView, append, remove) {
      append();
      remove();
      expect(layout.getView()).to.equal(view);
      expect(document.getElementById("test-view").innerHTML).to.equal("test");
    });
  });
});

describe("url helper", function() {
  it("should do a basic join and param substitution", function() {
    var href = Handlebars.helpers.url.call({}, "/a/{{b}}");
    expect(href).to.equal("#/a/");
    href = Handlebars.helpers.url.call({b: "b"}, "/a/{{b}}");
    expect(href).to.equal("#/a/b");
    href = Handlebars.helpers.url.call({b: "c"}, "/a/{{b}}");
    expect(href).to.equal("#/a/c");
    href = Handlebars.helpers.url("a", "c", {});
    expect(href).to.equal("#a/c");
  });

  it("url encoded params", function () {
    var slug = "hello world, sup!",
        actual = Handlebars.helpers.url("articles", slug, {}),
        expected = "#articles/hello%20world%2C%20sup!";
    expect(actual).to.eq(expected);

    var context = {slug: "hello world, sup!"},
        actual = Handlebars.helpers.url.call(context, "/articles/{{slug}}"),
        expected = "#/articles/hello%20world%2C%20sup!";

    expect(actual).to.eq(expected);
  });

  it("should work with pushState: true", function () {
    before(function() {
      this.previousPushState = Backbone.history._hasPushState;
      Backbone.history._hasPushState = true;
    });
  
    after(function() {
      Backbone.history._hasPushState = this.previousPushState;
    });
  
    it("should not have double slashes if the argument starts with a slash", function() {
      var url = Handlebars.helpers.url("/a");
      expect(url).to.equal('/a');
    });
  });
});

describe("link helper", function () {
  it("should allow multiple arguments to link", function() {
    var view = new (Handlebones.View.extend({
      template: Handlebars.compile("{{#link a b c class=\"test\"}}link{{/link}}"),
      context: function () {
        return {
          a: "a",
          b: "b",
          c: "c"
        };
      }
    }));
    view.render();
    expect(view.el.querySelector("a").className).to.equal("test");
    expect(view.el.querySelector("a").getAttribute("href")).to.equal("#a/b/c");
  });

  it("should allow empty string as link", function() {
    var test = Handlebars.compile("bl")();
    var view = new (Handlebones.View.extend({
      template: Handlebars.compile("{{#link \"\"}}text{{/link}}")
    }));
    view.render();
    expect(view.el.querySelector("a").innerHTML).to.equal("text");
  });
});

describe("view helper", function () {
  function generateChild () {
    return new (Handlebones.View.extend({
      name: "child",
      tagName: "li",
      template: Handlebars.compile("test")
    }));
  }

  function generateParent () {
    return new (Handlebones.View.extend({
      name: "parent",
      template: Handlebars.compile("<ul>{{view child}}</ul>"),
      context: function () {
        return {
          child: this.child
        };
      }
    }));
  }

  it("should fail silently when no view initialized", function () {
    var parent = generateParent();
    parent.render();
    expect(parent.el.querySelector("ul").innerHTML).to.equal("");
  });

  it("should embed a child view", function () {
    var parent = generateParent();
    parent.child = generateChild();
    parent.addChild(parent.child);
    parent.render();
    expect(parent.el.querySelector("ul > li").innerHTML).to.equal("test");
  });

  it("re-render of parent should not render child", function () {
    var parentRenderSpy = sinon.spy(),
      childRenderSpy = sinon.spy(),
      parent = generateParent(),
      child = generateChild();
    parent.child = child;
    parent.addChild(parent.child);
    parent.listenTo(parent, "render", parentRenderSpy);
    child.listenTo(child, "render", childRenderSpy);
    expect(parentRenderSpy.callCount).to.equal(0);
    expect(childRenderSpy.callCount).to.equal(0);
    parent.render();
    expect(parentRenderSpy.callCount).to.equal(1);
    expect(childRenderSpy.callCount).to.equal(1);
    parent.render();
    expect(parentRenderSpy.callCount).to.equal(2);
    expect(childRenderSpy.callCount).to.equal(1);
  });

  it("should allow child views within each #each", function() {
    var parent = new (Handlebones.View.extend({
      template: Handlebars.compile("{{#each views}}{{view this}}{{/each}}"),
      initialize: function () {
        this.views = [
          new (Handlebones.View.extend({
            template: Handlebars.compile("a")
          })),
          new (Handlebones.View.extend({
            template: Handlebars.compile("b")
          }))
        ];
        _.each(this.views, this.addChild, this);
      },
      context: function () {
        return {
          views: this.views
        }
      }
    }));
    parent.render();
    expect(parent.el.innerText.replace(/\r\n/g, "")).to.equal("ab");
  });

  it("should allow view to go in and out of scope", function () {
    var parent = new (Handlebones.View.extend({
      template: Handlebars.compile("{{#if condition}}<ul>{{view child}}</ul>{{/if}}"),
      initialize: function () {
        this.child = this.addChild(generateChild());
        this.condition = true;
      },
      context: function () {
        return {
          child: this.child,
          condition: this.condition
        };
      }
    }));
    var childRenderSpy = sinon.spy();
    parent.child.listenTo(parent.child, "render", childRenderSpy);
    parent.render();
    expect(parent.el.querySelector("li").innerHTML).to.equal("test");
    expect(childRenderSpy.callCount).to.equal(1);
    parent.condition = false;
    parent.render();
    expect(childRenderSpy.callCount).to.equal(1);
    expect(parent.el.querySelector("li")).to.be.null;
    parent.condition = true;
    parent.render();
    expect(childRenderSpy.callCount).to.equal(1);
    expect(parent.el.querySelector("li").innerHTML).to.equal("test");
  });
});
